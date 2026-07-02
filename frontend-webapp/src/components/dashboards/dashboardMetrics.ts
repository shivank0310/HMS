import type { DashboardApiData } from '@/types';

export function metricValue(
  data: DashboardApiData | null | undefined,
  key: string,
  fallback: string | number
) {
  const value = data?.metrics[key];
  if (value === null || value === undefined || value === '') return String(fallback);
  return String(value);
}

export function chainSyncedValue(data: DashboardApiData | null | undefined) {
  const modules = data?.blockchain.modules ?? [];
  const total = modules.reduce((sum, module) => sum + module.syncedCount, 0);
  return total ? String(total) : '0';
}
