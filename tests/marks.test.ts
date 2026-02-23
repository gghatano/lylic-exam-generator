import { describe, it, expect } from 'vitest'
import { toCircledNumber, isOverlapping, buildExcerpt } from '../src/core/marks.ts'

describe('toCircledNumber', () => {
  it('converts 1 to ①', () => {
    expect(toCircledNumber(1)).toBe('①')
  })

  it('converts 10 to ⑩', () => {
    expect(toCircledNumber(10)).toBe('⑩')
  })

  it('converts 20 to ⑳', () => {
    expect(toCircledNumber(20)).toBe('⑳')
  })

  it('converts 21 to ㉑', () => {
    expect(toCircledNumber(21)).toBe('㉑')
  })

  it('converts 30 to ㉚', () => {
    expect(toCircledNumber(30)).toBe('㉚')
  })

  it('throws for 0', () => {
    expect(() => toCircledNumber(0)).toThrow(RangeError)
  })

  it('throws for 31', () => {
    expect(() => toCircledNumber(31)).toThrow(RangeError)
  })
})

describe('isOverlapping', () => {
  it('returns true for overlapping ranges', () => {
    expect(isOverlapping({ start: 0, end: 5 }, { start: 3, end: 8 })).toBe(true)
  })

  it('returns false for non-overlapping ranges', () => {
    expect(isOverlapping({ start: 0, end: 3 }, { start: 5, end: 8 })).toBe(false)
  })

  it('returns true when one range contains the other', () => {
    expect(isOverlapping({ start: 0, end: 10 }, { start: 3, end: 5 })).toBe(true)
  })

  it('returns false for adjacent ranges (boundary)', () => {
    expect(isOverlapping({ start: 0, end: 3 }, { start: 3, end: 6 })).toBe(false)
  })

  it('returns true for the same range', () => {
    expect(isOverlapping({ start: 2, end: 5 }, { start: 2, end: 5 })).toBe(true)
  })
})

describe('buildExcerpt', () => {
  it('extracts basic text', () => {
    expect(buildExcerpt('hello world', 0, 5)).toBe('hello')
  })

  it('replaces newlines with spaces', () => {
    expect(buildExcerpt('hello\nworld', 0, 11)).toBe('hello world')
  })

  it('truncates with ellipsis when exceeding maxLen', () => {
    const long = 'a'.repeat(50)
    const result = buildExcerpt(long, 0, 50, 10)
    expect(result).toBe('a'.repeat(10) + '\u2026')
    expect(result.length).toBe(11) // 10 chars + ellipsis
  })

  it('trims whitespace', () => {
    expect(buildExcerpt('  hello  ', 0, 9)).toBe('hello')
  })

  it('returns empty string for empty range', () => {
    expect(buildExcerpt('hello', 2, 2)).toBe('')
  })
})
