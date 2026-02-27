// ── GAJIKU Backup: Validate ──
// Validates incoming backup JSON before any import processing.

import { BackupEnvelope, SCHEMA_VERSION } from '@/types/models';

export type ValidationError =
  | 'INVALID_JSON'
  | 'WRONG_FORMAT'
  | 'MISSING_META'
  | 'MISSING_DATA'
  | 'SCHEMA_TOO_NEW'
  | 'MISSING_TRANSACTIONS';

export interface ValidationResult {
  ok: boolean;
  envelope?: BackupEnvelope;
  error?: ValidationError;
  errorDetail?: string;
  needsMigration?: boolean;  // schema version < current
}

// ── Main validator ──
export function validateBackup(raw: string): ValidationResult {
  // 1. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: 'INVALID_JSON', errorDetail: String(e) };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'WRONG_FORMAT', errorDetail: 'Root must be an object' };
  }

  const obj = parsed as Record<string, unknown>;

  // 2. Validasi meta
  if (!obj.meta || typeof obj.meta !== 'object') {
    return { ok: false, error: 'MISSING_META', errorDetail: 'meta field is required' };
  }

  const meta = obj.meta as Record<string, unknown>;

  if (meta.format !== 'gajiku-backup') {
    return {
      ok: false,
      error: 'WRONG_FORMAT',
      errorDetail: `Expected format "gajiku-backup", got "${meta.format}"`,
    };
  }

  // 3. Validasi schema version
  const incomingVersion = Number(meta.schemaVersion ?? meta.version ?? 0);

  if (incomingVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'SCHEMA_TOO_NEW',
      errorDetail: `Backup was created with schema v${incomingVersion}, app only supports v${SCHEMA_VERSION}. Please update the app.`,
    };
  }

  // 4. Validasi data
  if (!obj.data || typeof obj.data !== 'object') {
    return { ok: false, error: 'MISSING_DATA', errorDetail: 'data field is required' };
  }

  const data = obj.data as Record<string, unknown>;

  if (!Array.isArray(data.transactions)) {
    return { ok: false, error: 'MISSING_TRANSACTIONS', errorDetail: 'data.transactions must be an array' };
  }

  // 5. OK
  return {
    ok: true,
    envelope: parsed as BackupEnvelope,
    needsMigration: incomingVersion < SCHEMA_VERSION,
  };
}

// ── Schema migration adapter ──
// Called when backup.schemaVersion < SCHEMA_VERSION
export function migrateBackup(envelope: BackupEnvelope): BackupEnvelope {
  const v = envelope.meta.schemaVersion ?? 0;

  // v0 → v1: old format used string timestamps and no BaseRecord fields
  if (v < 1) {
    const now = Date.now();
    envelope.data.transactions = envelope.data.transactions.map(t => ({
      ...t,
      // Convert ISO string → Unix ms if needed
      createdAt: typeof t.createdAt === 'string' ? new Date(t.createdAt).getTime() : (t.createdAt ?? now),
      updatedAt: typeof t.updatedAt === 'string' ? new Date(t.updatedAt).getTime() : (t.updatedAt ?? now),
      date:      typeof t.date      === 'string' ? new Date(t.date).getTime()      : (t.date      ?? now),
      deletedAt: null,
      isDirty: false,
    }));

    envelope.data.budgets = envelope.data.budgets.map(b => ({
      ...b,
      createdAt: typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt ?? now),
      updatedAt: typeof b.updatedAt === 'string' ? new Date(b.updatedAt).getTime() : (b.updatedAt ?? now),
      deletedAt: null,
      isDirty: false,
      spent: 0,
    }));

    envelope.data.savingsGoals = envelope.data.savingsGoals.map(g => ({
      ...g,
      createdAt: typeof g.createdAt === 'string' ? new Date(g.createdAt).getTime() : (g.createdAt ?? now),
      updatedAt: typeof g.updatedAt === 'string' ? new Date(g.updatedAt).getTime() : (g.updatedAt ?? now),
      deadline:  typeof g.deadline  === 'string' ? new Date(g.deadline).getTime()  : (g.deadline  ?? now),
      deletedAt: null,
      isDirty: false,
    }));

    envelope.data.notifications = (envelope.data.notifications ?? []).map(n => ({
      ...n,
      createdAt: typeof n.createdAt === 'string' ? new Date(n.createdAt).getTime() : (n.createdAt ?? now),
      updatedAt: typeof n.updatedAt === 'string' ? new Date(n.updatedAt).getTime() : (n.updatedAt ?? now),
      deletedAt: null,
      isDirty: false,
    }));

    envelope.meta.schemaVersion = 1;
  }

  // Future: add v1 → v2 migration here
  // if (v < 2) { ... }

  return envelope;
}
