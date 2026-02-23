import { describe, it, expect } from 'vitest'
import {
  buildRenderedLines,
  findLineByOffset,
  clampOffsetToLine,
} from '../src/core/textLines.ts'

describe('buildRenderedLines', () => {
  it('splits "ab\\nc" into two lines with correct offsets', () => {
    const lines = buildRenderedLines('ab\nc')
    expect(lines).toEqual([
      { start: 0, end: 2, hasNewline: true },
      { start: 3, end: 4, hasNewline: false },
    ])
  })

  it('handles empty string as single empty line', () => {
    const lines = buildRenderedLines('')
    expect(lines).toEqual([{ start: 0, end: 0, hasNewline: false }])
  })

  it('handles "a\\n\\nb" with empty middle line', () => {
    const lines = buildRenderedLines('a\n\nb')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toEqual({ start: 0, end: 1, hasNewline: true })
    expect(lines[1]).toEqual({ start: 2, end: 2, hasNewline: true })
    expect(lines[2]).toEqual({ start: 3, end: 4, hasNewline: false })
  })

  it('handles trailing newline "abc\\n"', () => {
    const lines = buildRenderedLines('abc\n')
    expect(lines).toEqual([
      { start: 0, end: 3, hasNewline: true },
      { start: 4, end: 4, hasNewline: false },
    ])
  })
})

describe('findLineByOffset', () => {
  const lines = buildRenderedLines('ab\nc')

  it('finds line 0 for offset 0', () => {
    expect(findLineByOffset(lines, 0)).toBe(0)
  })

  it('finds line 0 for offset 1', () => {
    expect(findLineByOffset(lines, 1)).toBe(0)
  })

  it('finds line 1 for offset 3', () => {
    expect(findLineByOffset(lines, 3)).toBe(1)
  })

  it('returns -1 for offset beyond text', () => {
    expect(findLineByOffset(lines, 10)).toBe(-1)
  })

  it('returns -1 for offset on newline char (offset 2)', () => {
    // offset 2 is the newline character itself, which is beyond line 0 end
    // and before line 1 start
    expect(findLineByOffset(lines, 2)).toBe(-1)
  })

  it('finds empty line when offset matches start', () => {
    const linesWithEmpty = buildRenderedLines('a\n\nb')
    // line 1 is empty: start=2, end=2
    expect(findLineByOffset(linesWithEmpty, 2)).toBe(1)
  })
})

describe('clampOffsetToLine', () => {
  it('returns offset as-is when within a line', () => {
    const lines = buildRenderedLines('ab\nc')
    expect(clampOffsetToLine(lines, 1)).toBe(1)
  })

  it('returns line.end when offset is at newline position', () => {
    const lines = buildRenderedLines('ab\nc')
    // line 0: end=2, hasNewline=true. Newline char is at position 2.
    expect(clampOffsetToLine(lines, 2)).toBe(2)
  })

  it('clamps offset beyond last line to last line end', () => {
    const lines = buildRenderedLines('ab\nc')
    expect(clampOffsetToLine(lines, 100)).toBe(4)
  })

  it('returns offset as-is for empty lines array', () => {
    expect(clampOffsetToLine([], 5)).toBe(5)
  })
})
