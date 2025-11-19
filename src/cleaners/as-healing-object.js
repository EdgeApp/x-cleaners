/**
 * @prettier
 */
import { asMaybe, asObject } from 'cleaners'

/**
 * Cleans an object that may contain errors.
 *
 * Tries to fix individual properties when possible.
 * For key-value objects, this will drop invalid entries unless an optional
 * fallback is provided. For shape objects, this will use the matching property
 * on the required fallback object.
 *
 * @param {Function|Object} shape - Either a cleaner function (for key-value objects)
 *   or a shape object with cleaner functions as values (for structured objects)
 * @param {Object} [fallback] - Optional fallback object. For key-value objects,
 *   provides default values for keys that fail validation. For shape objects,
 *   required and provides default values for all properties.
 * @returns {Function} A cleaner function that returns a cleaned object
 *
 * @example
 * // Key-value object with fallback
 * ```javascript
 * import { asHealingObject } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * const cleaner = asHealingObject(asNumber, { age: 0, count: 0 })
 * const result = cleaner({ age: '25', count: 'invalid', extra: '10' })
 * // Returns: { age: 25, count: 0, extra: 10 }
 * // - 'age': '25' converts to number 25 (valid)
 * // - 'count': 'invalid' fails validation, uses fallback 0
 * // - 'extra': '10' converts to number 10 (valid, no fallback needed)
 * ```
 *
 * @example
 * // Key-value object without fallback (invalid entries are dropped)
 * ```javascript
 * import { asHealingObject } from '@edge.app/x-cleaners'
 * import { asNumber } from 'cleaners'
 *
 * const cleaner = asHealingObject(asNumber)
 * const result = cleaner({ valid: '42', invalid: 'not-a-number' })
 * // Returns: { valid: 42 }
 * // - 'valid': '42' converts to number 42 (kept)
 * // - 'invalid': 'not-a-number' fails validation, dropped (no fallback)
 * ```
 *
 * @example
 * // Shape object with fallback
 * ```javascript
 * import { asHealingObject } from '@edge.app/x-cleaners'
 * import { asString, asNumber } from 'cleaners'
 *
 * const shapeCleaner = asHealingObject(
 *   { name: asString, age: asNumber },
 *   { name: 'Unknown', age: 0 }
 * )
 * const result = shapeCleaner({ name: 'John', age: 'invalid' })
 * // Returns: { name: 'John', age: 0 }
 * // - 'name': 'John' is valid string (kept)
 * // - 'age': 'invalid' fails validation, uses fallback 0
 *
 * const result2 = shapeCleaner({ name: 'John' })
 * // Returns: { name: 'John', age: 0 }
 * // - 'name': 'John' is valid string (kept)
 * // - 'age': missing, uses fallback 0
 * ```
 */
export function asHealingObject(shape, fallback) {
  if (typeof shape === 'function') {
    return function asMaybeObject(raw) {
      if (typeof raw !== 'object' || raw == null) return {}

      const out = {}

      const keys =
        fallback == null
          ? Object.keys(raw)
          : Object.keys({ ...raw, ...fallback })
      for (let i = 0; i < keys.length; ++i) {
        const key = keys[i]
        if (key === '__proto__') continue
        if (fallback?.[key] == null) {
          try {
            out[key] = shape(raw[key])
          } catch (error) {}
        } else {
          out[key] = asMaybe(shape, (fallback ?? {})[key])(raw[key])
        }
      }
      return out
    }
  }

  const safeShape = { ...shape }
  for (const key of Object.keys(shape)) {
    safeShape[key] = asMaybe(shape[key], fallback[key])
  }
  return asMaybe(asObject(safeShape), fallback)
}
