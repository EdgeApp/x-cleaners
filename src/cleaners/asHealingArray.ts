import type { Cleaner } from 'cleaners'

/**
 * Cleans an array that may contain errors.
 *
 * Invalid entries are removed from the resulting array (the healing process).
 *
 * @param cleaner - The cleaner function to apply to each array element
 * @returns A cleaner function that returns an array of cleaned values
 *
 * @example
 * ```typescript
 * import { asHealingArray } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * const cleaner = asHealingArray(asNumber)
 * const result = cleaner([1, 'invalid', 3, null, 5])
 * // Returns: [1, 3, 5]
 * // - Invalid entries are removed
 *
 * // Non-array input returns empty array
 * const result2 = cleaner('not-an-array')
 * // Returns: []
 * ```
 */
export function asHealingArray<T>(cleaner: Cleaner<T>): Cleaner<T[]> {
  return function asHealingArrayCleaner(raw: unknown): T[] {
    if (!Array.isArray(raw)) return []

    const out: T[] = []
    for (const item of raw) {
      try {
        out.push(cleaner(item))
      } catch (error) {}
    }
    return out
  }
}
