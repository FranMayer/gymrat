import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';

export function useAggressionMode() {
  const { userSettingsRepo } = useApp();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const settings = await userSettingsRepo.get();
      if (!cancelled) {
        setEnabled(settings?.aggressionMode ?? false);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userSettingsRepo]);

  const toggle = async () => {
    const current = await userSettingsRepo.get();
    const next = !current?.aggressionMode;
    await userSettingsRepo.save({ aggressionMode: next });
    setEnabled(next);
  };

  return { enabled, loading, toggle };
}
