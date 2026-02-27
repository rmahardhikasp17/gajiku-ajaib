// ── Native SQLite Module (Android / iOS only) ──
// This file will be fully implemented in Phase 5 (Native Features).
// For now it's a stub that does nothing, letting the app fall back gracefully.

import type { SQLiteConnection } from '@capacitor-community/sqlite';

export const SQLiteNative = {
  async init(_sqlite: SQLiteConnection): Promise<void> {
    // TODO Phase 5: Implement full SQLite native database layer
    // For now: no-op, data falls back to localStorage
    console.log('[GAJIKU] Native SQLite stub — will be implemented in Phase 5');
  },
};
