import { describe, expect, test } from 'bun:test'
import { asNumber, asString } from 'cleaners'

import { asHealingArray } from '../../src/cleaners/asHealingArray'

describe('asHealingArray', () => {
  describe('non-array input', () => {
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
  })

  describe('valid entries', () => {
    test('keeps all valid entries', () => {
      const cleaner = asHealingArray(asString)
      const input = ['hello', 'world', 'test']
      expect(cleaner(input)).toEqual(['hello', 'world', 'test'])
    })

    test('works with number cleaner', () => {
      const cleaner = asHealingArray(asNumber)
      const input = [1, 2, 3, 4, 5]
      expect(cleaner(input)).toEqual([1, 2, 3, 4, 5])
    })

    test('handles empty array', () => {
      const cleaner = asHealingArray(asString)
      expect(cleaner([])).toEqual([])
    })
  })

  describe('invalid entries (healing)', () => {
    test('removes invalid entries', () => {
      const cleaner = asHealingArray(asString)
      const input = ['hello', 123, 'world', null]
      expect(cleaner(input)).toEqual(['hello', 'world'])
    })

    test('removes all invalid entries from mixed array', () => {
      const cleaner = asHealingArray(asNumber)
      const input = [1, 'invalid', 2, null, 3, undefined, 4]
      expect(cleaner(input)).toEqual([1, 2, 3, 4])
    })

    test('returns empty array when all entries are invalid', () => {
      const cleaner = asHealingArray(asString)
      const input = [123, null, undefined, {}]
      expect(cleaner(input)).toEqual([])
    })

    test('removes null entries', () => {
      const cleaner = asHealingArray(asString)
      const input = ['a', null, 'b', null, 'c']
      expect(cleaner(input)).toEqual(['a', 'b', 'c'])
    })

    test('removes undefined entries', () => {
      const cleaner = asHealingArray(asNumber)
      const input = [1, undefined, 2, undefined, 3]
      expect(cleaner(input)).toEqual([1, 2, 3])
    })

    test('removes wrong type entries', () => {
      const cleaner = asHealingArray(asNumber)
      const input = [1, 'two', 3, 'four', 5]
      expect(cleaner(input)).toEqual([1, 3, 5])
    })
  })
})
