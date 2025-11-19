import { describe, expect, test } from 'bun:test'
import { asEither, asNumber, asString } from 'cleaners'

import { asHealingObject } from '../../src/cleaners/as-healing-object'

describe('asHealingObject', () => {
  describe('with function cleaner (key-value object)', () => {
    test('returns empty object for null input', () => {
      const cleaner = asHealingObject(asString)
      expect(cleaner(null)).toEqual({})
    })

    test('returns empty object for undefined input', () => {
      const cleaner = asHealingObject(asString)
      expect(cleaner(undefined)).toEqual({})
    })

    test('returns empty object for non-object input', () => {
      const cleaner = asHealingObject(asString)
      expect(cleaner('not an object')).toEqual({})
      expect(cleaner(123)).toEqual({})
      expect(cleaner(true)).toEqual({})
      expect(cleaner([])).toEqual({})
    })

    test('keeps valid entries', () => {
      const cleaner = asHealingObject(asString)
      const input = { a: 'hello', b: 'world', c: 'test' }
      expect(cleaner(input)).toEqual({ a: 'hello', b: 'world', c: 'test' })
    })

    test('drops invalid entries', () => {
      const cleaner = asHealingObject(asString)
      const input = { a: 'hello', b: 123, c: 'world', d: null }
      expect(cleaner(input)).toEqual({ a: 'hello', c: 'world' })
    })

    test('skips __proto__ key', () => {
      const cleaner = asHealingObject(asString)
      const input = { a: 'hello', __proto__: 'malicious' }
      const result = cleaner(input)
      expect(result).toEqual({ a: 'hello' })
      expect(Object.hasOwn(result, '__proto__')).toBe(false)
      expect(Object.keys(result)).not.toContain('__proto__')
    })

    test('handles empty object', () => {
      const cleaner = asHealingObject(asString)
      expect(cleaner({})).toEqual({})
    })

    test('handles object with all invalid entries', () => {
      const cleaner = asHealingObject(asString)
      const input = { a: 123, b: null, c: undefined }
      expect(cleaner(input)).toEqual({})
    })

    test('works with number cleaner', () => {
      const cleaner = asHealingObject(asNumber)
      const input = { a: 1, b: 2, c: 'invalid', d: 3 }
      expect(cleaner(input)).toEqual({ a: 1, b: 2, d: 3 })
    })

    test('uses fallback for invalid properties', () => {
      const fallback = { name: 'Unknown', orientation: 'bitcoiner' }
      const cleaner = asHealingObject(asString, fallback)
      const result = cleaner({ name: 'John', orientation: 67 })
      expect(result).toEqual({
        name: 'John',
        orientation: 'bitcoiner'
      })
    })

    test('uses fallback for missing properties', () => {
      const fallback = { name: 'Unknown', orientation: 'bitcoiner' }
      const cleaner = asHealingObject(asString, fallback)
      const result = cleaner({ name: 'John' })
      expect(result).toEqual({ name: 'John', orientation: 'bitcoiner' })
    })

    test('uses fallback for all invalid properties', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(asEither(asString, asNumber), fallback)
      const input = cleaner({ name: {}, age: [] })
      expect(input).toEqual(fallback)
    })

    test('drops invalid properties if fallback is missing entry', () => {
      const fallback = { name: 'Unknown', orientation: 'bitcoiner' }
      const cleaner = asHealingObject(asString, fallback)
      const result = cleaner({ name: 'John', age: 67 })
      expect(result).toEqual({ name: 'John', orientation: 'bitcoiner' })
    })
  })

  describe('with shape object and fallback', () => {
    test('returns fallback for null input', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      expect(cleaner(null)).toEqual(fallback)
    })

    test('returns fallback for undefined input', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      expect(cleaner(undefined)).toEqual(fallback)
    })

    test('returns fallback for non-object input', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      expect(cleaner('not an object')).toEqual(fallback)
      expect(cleaner(123)).toEqual(fallback)
    })

    test('keeps valid properties', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      const input = { name: 'John', age: 30 }
      expect(cleaner(input)).toEqual({ name: 'John', age: 30 })
    })

    test('uses fallback for invalid properties', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      const input = { name: 'John', age: 'invalid' }
      expect(cleaner(input)).toEqual({ name: 'John', age: 0 })
    })

    test('uses fallback for missing properties', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      const input = { name: 'John' }
      expect(cleaner(input)).toEqual({ name: 'John', age: 0 })
    })

    test('uses fallback for all invalid properties', () => {
      const fallback = { name: 'Unknown', age: 0 }
      const cleaner = asHealingObject(
        { name: asString, age: asNumber },
        fallback
      )
      const input = { name: 123, age: 'invalid' }
      expect(cleaner(input)).toEqual(fallback)
    })

    test('ignores extra properties', () => {
      const fallback = { name: 'Unknown' }
      const cleaner = asHealingObject({ name: asString }, fallback)
      const input = { name: 'John', extra: 'ignored', another: 123 }
      expect(cleaner(input)).toEqual({ name: 'John' })
    })

    test('handles complex nested shapes', () => {
      const fallback = { name: 'Unknown', age: 0, active: false }
      const cleaner = asHealingObject(
        {
          name: asString,
          age: asNumber,
          active: (raw: unknown) => {
            if (typeof raw === 'boolean') return raw
            throw new Error('Invalid boolean')
          }
        },
        fallback
      )
      const input = { name: 'John', age: 30, active: true }
      expect(cleaner(input)).toEqual({
        name: 'John',
        age: 30,
        active: true
      })
    })

    test('uses fallback for invalid nested properties', () => {
      const fallback = { name: 'Unknown', age: 0, active: false }
      const cleaner = asHealingObject(
        {
          name: asString,
          age: asNumber,
          active: (raw: unknown) => {
            if (typeof raw === 'boolean') return raw
            throw new Error('Invalid boolean')
          }
        },
        fallback
      )
      const input = { name: 'John', age: 30, active: 'not a boolean' }
      expect(cleaner(input)).toEqual({
        name: 'John',
        age: 30,
        active: false
      })
    })
  })
})
