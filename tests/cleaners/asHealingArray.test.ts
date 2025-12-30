import { describe, expect, test } from 'bun:test'
import { asNumber, asString } from 'cleaners'

import { asHealingArray } from '../../src/cleaners/asHealingArray'

describe('asHealingArray', () => {
  describe('without fallback', () => {
    test('returns empty array for null input', () => {
      const cleaner = asHealingArray(asString)
      expect(cleaner(null)).toEqual([])
    })

    test('returns empty array for undefined input', () => {
      const cleaner = asHealingArray(asString)
      expect(cleaner(undefined)).toEqual([])
    })

    test('returns empty array for non-array input', () => {
      const cleaner = asHealingArray(asString)
      expect(cleaner('not an array')).toEqual([])
      expect(cleaner(123)).toEqual([])
      expect(cleaner(true)).toEqual([])
      expect(cleaner({})).toEqual([])
    })

    test('keeps valid entries', () => {
      const cleaner = asHealingArray(asString)
      const input = ['hello', 'world', 'test']
      expect(cleaner(input)).toEqual(['hello', 'world', 'test'])
    })

    test('drops invalid entries', () => {
      const cleaner = asHealingArray(asString)
      const input = ['hello', 123, 'world', null]
      const result = cleaner(input)
      expect(result).toEqual(['hello', 'world'])
    })

    test('handles empty array', () => {
      const cleaner = asHealingArray(asString)
      expect(cleaner([])).toEqual([])
    })

    test('handles array with all invalid entries', () => {
      const cleaner = asHealingArray(asString)
      const input = [123, null, undefined, {}]
      expect(cleaner(input)).toEqual([])
    })

    test('works with number cleaner', () => {
      const cleaner = asHealingArray(asNumber)
      const input = [1, 2, 'invalid', 3]
      const result = cleaner(input)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('with fallback array', () => {
    test('returns empty array for null input', () => {
      const fallback = ['default']
      const cleaner = asHealingArray(asString, fallback)
      expect(cleaner(null)).toEqual([])
    })

    test('returns empty array for undefined input', () => {
      const fallback = ['default']
      const cleaner = asHealingArray(asString, fallback)
      expect(cleaner(undefined)).toEqual([])
    })

    test('returns empty array for non-array input', () => {
      const fallback = ['default']
      const cleaner = asHealingArray(asString, fallback)
      expect(cleaner('not an array')).toEqual([])
      expect(cleaner(123)).toEqual([])
    })

    test('keeps valid entries', () => {
      const fallback = ['default', 'fallback', 'value']
      const cleaner = asHealingArray(asString, fallback)
      const input = ['hello', 'world', 'test']
      expect(cleaner(input)).toEqual(['hello', 'world', 'test'])
    })

    test('uses fallback for invalid entries at specific indices', () => {
      const fallback = ['default', 'fallback', 'value']
      const cleaner = asHealingArray(asString, fallback)
      const input = ['hello', 123, 'world']
      expect(cleaner(input)).toEqual(['hello', 'fallback', 'world'])
    })

    test('drops invalid entries when fallback is missing at that index', () => {
      const fallback = ['default']
      const cleaner = asHealingArray(asString, fallback)
      const input = ['hello', 123, 'world', null]
      const result = cleaner(input)
      expect(result).toEqual(['hello', 'world'])
    })

    test('uses fallback for missing entries at specific indices', () => {
      const fallback = ['default', 'fallback', 'value']
      const cleaner = asHealingArray(asString, fallback)
      const input = ['hello', null, 'world']
      // Index 0: 'hello' is valid, kept
      // Index 1: null is invalid, fallback[1] = 'fallback', so use fallback
      // Index 2: 'world' is valid, kept
      expect(cleaner(input)).toEqual(['hello', 'fallback', 'world'])
    })

    test('handles fallback array longer than input array', () => {
      const fallback = ['default', 'fallback', 'value', 'extra']
      const cleaner = asHealingArray(asString, fallback)
      const input = ['hello', 123]
      // Index 0: 'hello' is valid, kept
      // Index 1: 123 is invalid, fallback[1] = 'fallback', so use fallback
      expect(cleaner(input)).toEqual(['hello', 'fallback', 'value', 'extra'])
    })

    test('uses fallback for all invalid entries when fallback provided', () => {
      const fallback = ['default', 'fallback', 'value']
      const cleaner = asHealingArray(asString, fallback)
      const input = [123, null, {}]
      expect(cleaner(input)).toEqual(['default', 'fallback', 'value'])
    })

    test('handles empty array with fallback', () => {
      const fallback = ['default', 'fallback']
      const cleaner = asHealingArray(asString, fallback)
      expect(cleaner([])).toEqual(['default', 'fallback'])
    })

    test('works with number cleaner and fallback', () => {
      const fallback = [0, 1, 2]
      const cleaner = asHealingArray(asNumber, fallback)
      const input = [10, 'invalid', 20, null]
      expect(cleaner(input)).toEqual([10, 1, 20])
    })

    test('uses fallback when entry is invalid at specific index', () => {
      const fallback = []
      fallback[0] = 'first'
      fallback[2] = 'third'
      const cleaner = asHealingArray(asString, fallback)
      const input = ['valid', 'also invalid', 23]
      // Index 0: 'valid' is valid, kept
      // Index 1: 'also invalid' is valid (it's a string), kept
      expect(cleaner(input)).toEqual(['valid', 'also invalid', 'third'])
    })
  })
})
