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