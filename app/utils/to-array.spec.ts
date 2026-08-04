import { describe, it, expect } from 'vitest'
import { toArray } from './to-array'

describe('toArray', () => {
  it('wraps a scalar into an array', () => {
    expect(toArray('a')).toEqual(['a'])
  })

  it('returns an array as-is (same instance, not a copy)', () => {
    const input = ['a', 'b']
    expect(toArray(input)).toBe(input)
  })

  it('returns a readonly array as-is', () => {
    const input: readonly string[] = ['a', 'b']
    expect(toArray(input)).toBe(input)
  })

  it('normalizes null to an empty array', () => {
    expect(toArray(null)).toEqual([])
  })

  it('normalizes undefined to an empty array', () => {
    expect(toArray(undefined)).toEqual([])
  })

  it('returns an empty array as-is', () => {
    expect(toArray([])).toEqual([])
  })

  it('supports non-string scalars', () => {
    expect(toArray(5)).toEqual([5])
  })
})
