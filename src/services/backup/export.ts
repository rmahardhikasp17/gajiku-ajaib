// ── GAJIKU Backup: Export ──
// Produces a versioned JSON envelope ready for file download or share.

import {
  AppData,
  BackupEnvelope,
  BackupMeta,
  SCHEMA_VERSION,
  nowMs,
} from '@/types/models';
import { getDeviceId } from '@/lib/deviceId';

const APP_VERSION = '1.0.0';

// ── Main export function ──
export async function exportBackup(data: AppData): Promise<string> {
  const meta: BackupMeta = {
    format: 'gajiku-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowMs(),
    appVersion: APP_VERSION,
    deviceId: getDeviceId(),
    recordCounts: {
      transactions: data.transactions.length,
      budgets: data.budgets.length,
      savingsGoals: data.savingsGoals.length,
      notifications: data.notifications.filter(n => !n.deletedAt).length,
    },
  };

  const envelope: BackupEnvelope = { meta, data };
  return JSON.stringify(envelope, null, 2);
}

// ── Trigger file download in browser ──
export function downloadBackup(jsonString: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `gajiku-backup-${date}.json`;
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
