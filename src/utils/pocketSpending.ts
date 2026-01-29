import { Pocket } from '../types/pocket';

export const applyExpenseToPocket = (
  pockets: Pocket[],
  pocketId: string,
  amount: number
): Pocket[] => {
  return pockets.map((p) =>
    p.id === pocketId
      ? { ...p, spent: p.spent + amount }
      : p
  );
};
