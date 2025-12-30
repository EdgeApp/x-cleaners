import { asMaybe, type Cleaner } from 'cleaners'

/**
 * Cleans a tuple that may contain errors.
 *
 * Tries to fix individual elements when possible.
 * The fallback array determines the tuple length and provides default values
 * for invalid entries.
 *
 * @param cleaner - The cleaner function to apply to each tuple element
 * @param fallback - Array of fallback values that defines the tuple length.
 *   If an element at index `i` fails validation, `fallback[i]` will be used.
 * @returns A cleaner function that returns a tuple of cleaned values with fixed length
 *
 * @example
 * ```typescript
 * import { asHealingTuple } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * // Tuple with fallback (invalid entries use fallback at same index)
 * const cleaner = asHealingTuple(asNumber, [0, 0, 0] as const)
 * const result = cleaner([1, 'invalid', 3])
 * // Returns: [1, 0, 3] with type [number, number, number]
 * // - Index 0: 1 is valid number (kept)
 * // - Index 1: 'invalid' fails validation, uses fallback[1] = 0
 * // - Index 2: 3 is valid number (kept)
 *
 * // Tuple size is fixed to fallback length
 * const cleaner2 = asHealingTuple(asNumber, [10, 20] as const)
 * const result2 = cleaner2([1, 2, 3, 4, 5])
 * // Returns: [1, 2] with type [number, number]
 * // - Only first 2 elements are kept (fallback length = 2)
 *
 * // Non-array input returns fallback tuple
 * const result3 = cleaner2('not-an-array')
 * // Returns: [10, 20]
 * ```
 */
export function asHealingTuple<T, const F extends readonly T[]>(
  cleaner: Cleaner<T>,
  fallback: F
): Cleaner<{ -readonly [K in keyof F]: T }> {
  return function asMaybeTuple(raw: unknown): { -readonly [K in keyof F]: T } {
    if (!Array.isArray(raw)) {
      return [...fallback] as { -readonly [K in keyof F]: T }
    }

    const out: T[] = []
    const length = fallback.length
    for (let i = 0; i < length; ++i) {
      out.push(asMaybe(cleaner, fallback[i] as T)(raw[i]))
    }
    return out as { -readonly [K in keyof F]: T }
  }
}

