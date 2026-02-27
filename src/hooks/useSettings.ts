import { useState, useCallback, useEffect } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/types/models';
import * as database from '@/services/database';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await database.getSettings();
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await database.updateSettings(updates);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, loading, update, refresh };
}
