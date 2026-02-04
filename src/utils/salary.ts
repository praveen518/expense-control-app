import { Pocket } from '../types/pocket';

export const getTotalAllocated = (pockets: Pocket[]): number => {
  return pockets.reduce((sum, p) => sum + p.allocated, 0);
};

export const getRemainingSalary = (
  salary: number,
  pockets: Pocket[]
): number => {
  return salary - getTotalAllocated(pockets);
};
