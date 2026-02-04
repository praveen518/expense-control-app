import { formatINR } from './currency';

export function formatHiddenAmount(
  value: number,
  visible: boolean
) {
  if (!visible) {
    return '₹ *****';
  }
  return formatINR(value);
}
