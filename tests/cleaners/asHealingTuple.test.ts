import { describe, expect, test } from 'bun:test'
import { asNumber, asString } from 'cleaners'

import { asHealingTuple } from '../../src/cleaners/asHealingTuple'

describe('asHealingTuple', () => {
  describe('tuple size', () => {
    test('returns tuple with exact length of fallback', () => {
      const cleaner = asHealingTuple(asString, ['a', 'b', 'c'] as const)
      const result = cleaner(['x', 'y', 'z'])
      expect(result).toHaveLength(3)
      expect(result).toEqual(['x', 'y', 'z'])
    })

    test('truncates input longer than fallback length', () => {
      const cleaner = asHealingTuple(asNumber, [0, 0] as const)
      const result = cleaner([1, 2, 3, 4, 5])
      expect(result).toHaveLength(2)
      expect(result).toEqual([1, 2])
    })

    test('pads with fallback when input is shorter than fallback length', () => {
      const cleaner = asHealingTuple(asString, ['a', 'b', 'c', 'd'] as const)
      const result = cleaner(['x', 'y'])
      expect(result).toHaveLength(4)
      expect(result).toEqual(['x', 'y', 'c', 'd'])
    })

    test('returns fallback tuple for empty input array', () => {
      const cleaner = asHealingTuple(asNumber, [1, 2, 3] as const)
      const result = cleaner([])
      expect(result).toHaveLength(3)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('non-array input', () => {
    test('returns fallback tuple for null input', () => {
      const fallback = ['default', 'fallback'] as const
      const cleaner = asHealingTuple(asString, fallback)
      const result = cleaner(null)
      expect(result).toHaveLength(2)
      expect(result).toEqual(['default', 'fallback'])
    })

    test('returns fallback tuple for undefined input', () => {
      const fallback = ['default', 'fallback'] as const
      const cleaner = asHealingTuple(asString, fallback)
      const result = cleaner(undefined)
      expect(result).toHaveLength(2)
      expect(result).toEqual(['default', 'fallback'])
    })

    test('returns fallback tuple for non-array input', () => {
      const fallback = ['a', 'b', 'c'] as const
      const cleaner = asHealingTuple(asString, fallback)
      expect(cleaner('not an array')).toEqual(['a', 'b', 'c'])
      expect(cleaner(123)).toEqual(['a', 'b', 'c'])
      expect(cleaner(true)).toEqual(['a', 'b', 'c'])
      expect(cleaner({})).toEqual(['a', 'b', 'c'])
    })
  })

  describe('valid entries', () => {
    test('keeps valid entries in their positions', () => {
      const cleaner = asHealingTuple(asString, ['a', 'b', 'c'] as const)
      const input = ['hello', 'world', 'test']
      expect(cleaner(input)).toEqual(['hello', 'world', 'test'])
    })

    test('works with number cleaner', () => {
      const cleaner = asHealingTuple(asNumber, [0, 0, 0] as const)
      const input = [10, 20, 30]
      expect(cleaner(input)).toEqual([10, 20, 30])
    })
  })

  describe('invalid entries', () => {
    test('uses fallback for invalid entries at specific indices', () => {
      const fallback = ['default', 'fallback', 'value'] as const
      const cleaner = asHealingTuple(asString, fallback)
      const input = ['hello', 123, 'world']
      expect(cleaner(input)).toEqual(['hello', 'fallback', 'world'])
    })

    test('uses fallback for null entries', () => {
      const fallback = ['a', 'b', 'c'] as const
      const cleaner = asHealingTuple(asString, fallback)
      const input = ['hello', null, 'world']
      expect(cleaner(input)).toEqual(['hello', 'b', 'world'])
    })

    test('uses fallback for undefined entries', () => {
      const fallback = [1, 2, 3] as const
      const cleaner = asHealingTuple(asNumber, fallback)
      const input = [10, undefined, 30]
      expect(cleaner(input)).toEqual([10, 2, 30])
    })

    test('uses fallback for all invalid entries', () => {
      const fallback = ['default', 'fallback', 'value'] as const
      const cleaner = asHealingTuple(asString, fallback)
      const input = [123, null, {}]
      expect(cleaner(input)).toEqual(['default', 'fallback', 'value'])
    })

    test('works with number cleaner and fallback', () => {
      const fallback = [0, 1, 2] as const
      const cleaner = asHealingTuple(asNumber, fallback)
      const input = [10, 'invalid', 20]
      expect(cleaner(input)).toEqual([10, 1, 20])
    })
  })

  describe('type safety', () => {
    test('result has correct tuple type length', () => {
      const cleaner = asHealingTuple(asNumber, [0, 0, 0] as const)
      const result = cleaner([1, 2, 3])

      // TypeScript should infer result as [number, number, number]
      // At runtime, verify the tuple contract
      expect(result.length).toBe(3)

      // Access elements by index (tuple-style)
      const [first, second, third] = result
      expect(first).toBe(1)
      expect(second).toBe(2)
      expect(third).toBe(3)
    })

    test('single element tuple', () => {
      const cleaner = asHealingTuple(asString, ['default'] as const)
      const result = cleaner(['value'])
      expect(result).toHaveLength(1)
      expect(result).toEqual(['value'])
    })

    test('two element tuple', () => {
      const cleaner = asHealingTuple(asNumber, [0, 0] as const)
      const result = cleaner([42, 99])
      expect(result).toHaveLength(2)
      expect(result).toEqual([42, 99])
    })

    test('five element tuple', () => {
      const cleaner = asHealingTuple(asString, [
        'a',
        'b',
        'c',
        'd',
        'e'
      ] as const)
      const result = cleaner(['1', '2', '3', '4', '5'])
      expect(result).toHaveLength(5)
      expect(result).toEqual(['1', '2', '3', '4', '5'])
    })
  })
})
