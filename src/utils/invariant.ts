export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    if (__DEV__) {
      throw new Error(`[INVARIANT FAILED] ${message}`);
    } else {
      // In production, still fail fast
      throw new Error('Unexpected application state');
    }
  }
}
