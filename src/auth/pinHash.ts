// src/auth/pinHash.ts

/**
 * Lightweight deterministic hash for app PINs.
 * NOT cryptographic, but sufficient for:
 * - offline app lock
 * - no plaintext storage
 * - no dependencies
 */

const SALT = 'expense-control-app';

export function hashPin(pin: string): string {
  let hash = 0;
  const str = `${SALT}:${pin}`;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit
  }

  // Convert to positive hex string
  return Math.abs(hash).toString(16);
}
