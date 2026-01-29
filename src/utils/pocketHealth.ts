import { Pocket } from '../types/pocket';

export const getRemainingAmount = (pocket: Pocket): number => {
  return pocket.allocated - pocket.spent;
};

export const getRemainingPercentage = (pocket: Pocket): number => {
  return getRemainingAmount(pocket) / pocket.allocated;
};

export const getHealthStatus = (pocket: Pocket) => {
  const pct = getRemainingPercentage(pocket);

  if (pct < 0) return 'overspent';
  if (pct < 0.1) return 'critical';
  if (pct < 0.3) return 'warning';
  return 'safe';
};

export const getHealthLabel = (
  remaining: number,
  allocated: number
): string => {
  if (remaining < 0) return '🟥 Debt';

  const ratio = remaining / allocated;

  if (ratio < 0.1) return '🔴 Critical';
  if (ratio < 0.3) return '🟡 Warning';
  return '🟢 Safe';
};

export const getHealthType = (
  remaining: number,
  allocated: number
): 'safe' | 'warning' | 'critical' | 'debt' => {
  if (remaining < 0) return 'debt';

  const ratio = remaining / allocated;

  if (ratio <= 0.1) return 'critical';
  if (ratio <= 0.3) return 'warning';
  return 'safe';
};

export const getHealthRank = (
  remaining: number,
  allocated: number
): number => {
  if (remaining < 0) return 0;        // Debt
  const ratio = remaining / allocated;
  if (ratio <= 0.1) return 1;         // Critical
  if (ratio <= 0.3) return 2;         // Warning
  return 3;                           // Safe
};

