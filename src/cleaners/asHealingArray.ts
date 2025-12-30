import { asMaybe, type Cleaner } from 'cleaners'

/**
 * Cleans an array that may contain errors.
 *
 * Tries to fix individual elements when possible.
 * This will drop invalid entries unless an optional fallback is provided for
 * a particular entry (i.e. index-based; `fallback[i]`).
 *
 * @param cleaner - The cleaner function to apply to each array element
 * @param fallback - Optional array of fallback values. If an element at index `i`
 *   fails validation, `fallback[i]` will be used if it exists. If `fallback[i]`
 *   is undefined or null, the invalid element is dropped.
 * @returns A cleaner function that returns an array of cleaned values
 *
 * @example
 * ```typescript
 * import { asHealingArray } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * // Array with fallback (invalid entries use fallback at same index)
 * const cleaner = asHealingArray(asNumber, [0, 0, 0])
 * const result = cleaner([1, 'invalid', 3, 'also-invalid', 5])
 * // Returns: [1, 0, 3, 5]
 * // - Index 0: 1 is valid number (kept)
 * // - Index 1: 'invalid' fails validation, uses fallback[1] = 0
 * // - Index 2: 3 is valid number (kept)
 * // - Index 3: 'also-invalid' fails validation, fallback[3] is undefined → dropped
 * // - Index 4: 5 is valid number (kept)
 *
 * // Array without fallback (invalid entries are dropped)
 * const cleaner2 = asHealingArray(asNumber)
 * const result2 = cleaner2([1, 'invalid', 3])
 * // Returns: [1, 3]
 * // - Invalid entries are dropped when no fallback is available
 *
 * // Non-array input returns empty array
 * const result3 = cleaner2('not-an-array')
 * // Returns: []
 * ```
 */
export function asHealingArray<T>(
  cleaner: Cleaner<T>,
  fallback?: T[]
): Cleaner<T[]> {
  return function asMaybeArray(raw: unknown): T[] {
    if (!Array.isArray(raw)) return []

    const out: T[] = []
    const length = Math.max(raw.length, fallback?.length ?? 0)
    for (let i = 0; i < length; ++i) {
      if (fallback?.[i] == null) {
        try {
          out.push(cleaner(raw[i]))
        } catch (error) {}
      } else {
        out.push(asMaybe(cleaner, fallback[i] as T)(raw[i]))
      }
    }
    return out
  }
}
