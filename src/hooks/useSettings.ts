import { useState, useCallback } from 'react';
import { AppSettings } from '@/types/models';
import * as storage from '@/services/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  const update = useCallback((updates: Partial<AppSettings>) => {
    const result = storage.updateSettings(updates);
    setSettings(result);
    return result;
  }, []);

  return { settings, update };
}
