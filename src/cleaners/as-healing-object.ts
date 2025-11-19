import { asMaybe, asObject } from 'cleaners'

import type { Cleaner, CleanerShape } from 'cleaners'

/**
 * Cleans an object that may contain errors.
 *
 * Tries to fix individual properties when possible.
 * For key-value objects, this will drop invalid entries unless an optional
 * fallback is provided. For shape objects, this will use the matching property
 * on the required fallback object.
 *
 * @param cleaner - The cleaner function to apply to each object value (for key-value objects)
 * @param fallback - Optional fallback object providing default values for keys that fail validation
 * @returns A cleaner function that returns a cleaned key-value object
 *
 * @example
 * ```typescript
 * import { asHealingObject } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * // Key-value object with fallback
 * const cleaner = asHealingObject(asNumber, { age: 0, count: 0 })
 * const result = cleaner({ age: '25', count: 'invalid', extra: '10' })
 * // Returns: { age: 25, count: 0, extra: 10 }
 * ```
 *
 * @example
 * ```typescript
 * // Key-value object without fallback (invalid entries are dropped)
 * const cleaner = asHealingObject(asNumber)
 * const result = cleaner({ valid: '42', invalid: 'not-a-number' })
 * // Returns: { valid: 42 }
 * ```
 */
export function asHealingObject<T>(
  cleaner: Cleaner<T>,
  fallback?: { [keys: string]: T }
): Cleaner<{ [keys: string]: T }>
/**
 * Cleans a shape object that may contain errors.
 *
 * @param shape - A shape object with cleaner functions as values
 * @param fallback - Required fallback object providing default values for all properties
 * @returns A cleaner function that returns a cleaned shape object
 *
 * @example
 * ```typescript
 * import { asHealingObject } from '@edge.app/x-cleaners'
 * import { asString, asNumber } from 'cleaners'
 *
 * // Shape object with fallback
 * const shapeCleaner = asHealingObject(
 *   { name: asString, age: asNumber },
 *   { name: 'Unknown', age: 0 }
 * )
 * const result = shapeCleaner({ name: 'John', age: 'invalid' })
 * // Returns: { name: 'John', age: 0 }
 *
 * const result2 = shapeCleaner({ name: 'John' })
 * // Returns: { name: 'John', age: 0 }
 * ```
 */
export function asHealingObject<T extends object>(
  shape: CleanerShape<T>,
  fallback: T
): Cleaner<T>

export function asHealingObject<T extends object>(
  shape: Cleaner<T> | CleanerShape<T>,
  fallback: T
): Cleaner<T> {
  if (typeof shape === 'function') {
    return function asMaybeObject(raw: unknown): T {
      if (typeof raw !== 'object' || raw == null) return {} as T

      const out = {}

      const keys =
        fallback == null
          ? Object.keys(raw)
          : Object.keys({ ...raw, ...fallback })
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i] as keyof T
        if (key === '__proto__') continue
        if (fallback?.[key] == null) {
          try {
            // @ts-expect-error - We know this is a valid key
            out[key] = shape(raw[key])
          } catch (error) {}
        } else {
          // @ts-expect-error - We know this is a valid key
          out[key] = asMaybe(shape, (fallback ?? {})[key])(raw[key])
        }
      }
      return out as T
    }
  }

  const safeShape = { ...shape }
  for (const key of Object.keys(shape)) {
    // @ts-expect-error - We know this is a valid key
    safeShape[key] = asMaybe(shape[key], fallback[key])
  }
  return asMaybe(asObject(safeShape), fallback)
}
