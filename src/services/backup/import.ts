// ── GAJIKU Backup: Import ──
// Two strategies: Full Replace and Smart Merge.
// Handles all edge cases including the soft-delete propagation.

import {
  AppData,
  BackupEnvelope,
  ImportStrategy,
  ImportResult,
  Transaction,
  Budget,
  SavingsGoal,
  Notification,
  nowMs,
} from '@/types/models';
import { validateBackup, migrateBackup } from './validate';

// ── Storage adapter interface — decoupled from implementation ──
// This allows swapping localStorage ↔ SQLite ↔ Supabase without changing merge logic
export interface StorageAdapter {
  getAll(): Promise<AppData>;
  saveAll(data: AppData): Promise<void>;
}

// ── Parse & validate raw JSON ──
export function parseBackupFile(raw: string): BackupEnvelope {
  const result = validateBackup(raw);
  if (!result.ok || !result.envelope) {
    throw new Error(result.errorDetail ?? result.error ?? 'Invalid backup file');
  }

  let envelope = result.envelope;

  // Auto-migrate if schema version is older
  if (result.needsMigration) {
    envelope = migrateBackup(envelope);
  }

  return envelope;
}

// ════════════════════════════════════════════
//  STRATEGY A: Full Replace
// ════════════════════════════════════════════
// Safest option. Wipes current data, replaces with backup.
// Shows confirmation dialog before executing.

export async function importFullReplace(
  raw: string,
  adapter: StorageAdapter
): Promise<ImportResult> {
  const envelope = parseBackupFile(raw);
  const incoming = envelope.data;

  // Mark all incoming records as clean (not dirty)
  const data: AppData = {
    transactions: incoming.transactions.map(t => ({ ...t, isDirty: false })),
    budgets: incoming.budgets.map(b => ({ ...b, isDirty: false, spent: 0 })),
    savingsGoals: incoming.savingsGoals.map(g => ({ ...g, isDirty: false })),
    notifications: incoming.notifications.map(n => ({ ...n, isDirty: false })),
    settings: incoming.settings,
  };

  await adapter.saveAll(data);

  return {
    success: true,
    strategy: 'full_replace',
    counts: {
      added: incoming.transactions.length +
             incoming.budgets.length +
             incoming.savingsGoals.length,
      updated: 0,
      skipped: 0,
      deleted: 0,
      conflicts: 0,
    },
  };
}

// ════════════════════════════════════════════
//  STRATEGY B: Smart Merge
// ════════════════════════════════════════════
// Compares each record by (id + updatedAt).
// Handles 4 cases:
//   1. New record from backup  → INSERT
//   2. Incoming newer          → UPDATE
//   3. Local newer             → SKIP (keep local)
//   4. Soft delete propagation → apply if incoming.deletedAt newer
// 
// ⚠️ Edge case: incoming.deletedAt > local.updatedAt → delete local
// ⚠️ Edge case: local.deletedAt != null AND incoming.deletedAt == null →
//    incoming is "undelete" — apply if incoming.updatedAt > local.deletedAt

export async function importSmartMerge(
  raw: string,
  adapter: StorageAdapter
): Promise<ImportResult> {
  const envelope = parseBackupFile(raw);
  const incoming = envelope.data;
  const local = await adapter.getAll();

  const counts = { added: 0, updated: 0, skipped: 0, deleted: 0, conflicts: 0 };

  // ── Merge helper for any entity type ──
  function mergeRecords<T extends {
    id: string;
    updatedAt: number;
    deletedAt: number | null;
    isDirty: boolean;
  }>(localList: T[], incomingList: T[]): T[] {
    const localMap = new Map<string, T>(localList.map(r => [r.id, r]));

    for (const inc of incomingList) {
      const loc = localMap.get(inc.id);

      if (!loc) {
        // Case 1: New record not seen locally → INSERT
        localMap.set(inc.id, { ...inc, isDirty: false });
        counts.added++;
        continue;
      }

      // ── Soft delete edge cases ──

      // Case: incoming deleted, local is alive
      // → Apply delete only if incoming.deletedAt > local.updatedAt
      if (inc.deletedAt !== null && loc.deletedAt === null) {
        if (inc.deletedAt > loc.updatedAt) {
          localMap.set(inc.id, { ...inc, isDirty: false });
          counts.deleted++;
        } else {
          // Local was updated after incoming delete → local wins, skip
          counts.skipped++;
        }
        continue;
      }

      // Case: incoming is ALIVE, local was deleted
      // → "Undelete" only if incoming.updatedAt > local.deletedAt
      if (inc.deletedAt === null && loc.deletedAt !== null) {
        if (inc.updatedAt > loc.deletedAt) {
          localMap.set(inc.id, { ...inc, isDirty: false });
          counts.updated++;
        } else {
          // Local delete happened after — keep deleted
          counts.skipped++;
        }
        continue;
      }

      // ── Normal update comparison ──
      if (inc.updatedAt > loc.updatedAt) {
        // Case 2: Incoming newer → UPDATE
        localMap.set(inc.id, { ...inc, isDirty: false });
        counts.updated++;
      } else if (inc.updatedAt < loc.updatedAt) {
        // Case 3: Local newer → SKIP
        counts.skipped++;
      } else {
        // Same timestamp — detect silent conflict (same time, different content)
        const isSame = JSON.stringify(inc) === JSON.stringify(loc);
        if (!isSame) counts.conflicts++;
        // Keep local for conflicts at same timestamp
        counts.skipped++;
      }
    }

    return Array.from(localMap.values());
  }

  // ── Merge all tables ──
  const merged: AppData = {
    transactions: mergeRecords(local.transactions, incoming.transactions),
    budgets:      mergeRecords(local.budgets, incoming.budgets).map(b => ({ ...b, spent: 0 })),
    savingsGoals: mergeRecords(local.savingsGoals, incoming.savingsGoals),
    notifications: mergeRecords(local.notifications, incoming.notifications),
    // Settings: use incoming if backup was exported more recently
    settings: envelope.meta.exportedAt > ((local.settings as unknown as { _exportedAt?: number })._exportedAt ?? 0)
      ? incoming.settings
      : local.settings,
  };

  await adapter.saveAll(merged);

  return {
    success: true,
    strategy: 'smart_merge',
    counts,
  };
}
