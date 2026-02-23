import { describe, it, expect } from 'vitest'
import { filterRects, mergeRectsByLine, rectsToSegments } from '../src/core/rects.ts'

function mockRect(x: number, y: number, w: number, h: number): DOMRect {
  return {
    x,
    y,
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
    toJSON: () => ({}),
  } as DOMRect
}

describe('filterRects', () => {
  it('removes rects with width < 1', () => {
    const rects = [mockRect(0, 0, 0.5, 10), mockRect(0, 0, 10, 10)]
    expect(filterRects(rects)).toHaveLength(1)
    expect(filterRects(rects)[0].width).toBe(10)
  })

  it('removes rects with height < 1', () => {
    const rects = [mockRect(0, 0, 10, 0.5), mockRect(0, 0, 10, 10)]
    expect(filterRects(rects)).toHaveLength(1)
  })

  it('keeps rects with width and height >= 1', () => {
    const rects = [mockRect(0, 0, 1, 1), mockRect(5, 5, 100, 20)]
    expect(filterRects(rects)).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(filterRects([])).toEqual([])
  })
})

describe('mergeRectsByLine', () => {
  it('merges rects with similar top into one MergedRect', () => {
    const rects = [
      mockRect(10, 100, 20, 15),
      mockRect(40, 101, 30, 15), // top=101, within tolY=2 of 100
    ]
    const merged = mergeRectsByLine(rects)
    expect(merged).toHaveLength(1)
    expect(merged[0]).toEqual({
      top: 100,
      bottom: 116, // max(115, 116)
      left: 10,
      right: 70, // max(30, 70)
    })
  })

  it('keeps separate lines apart', () => {
    const rects = [
      mockRect(10, 100, 20, 15),
      mockRect(10, 120, 20, 15), // top=120, far from 100
    ]
    const merged = mergeRectsByLine(rects)
    expect(merged).toHaveLength(2)
    expect(merged[0].top).toBe(100)
    expect(merged[1].top).toBe(120)
  })

  it('handles unsorted input', () => {
    const rects = [
      mockRect(10, 200, 20, 15), // line 2
      mockRect(10, 100, 20, 15), // line 1
      mockRect(10, 150, 20, 15), // line 1.5
    ]
    const merged = mergeRectsByLine(rects)
    expect(merged).toHaveLength(3)
    expect(merged[0].top).toBe(100)
    expect(merged[1].top).toBe(150)
    expect(merged[2].top).toBe(200)
  })

  it('returns empty array for empty input', () => {
    expect(mergeRectsByLine([])).toEqual([])
  })
})

describe('rectsToSegments', () => {
  it('computes correct coordinate transformation', () => {
    const merged = [{ top: 110, bottom: 125, left: 50, right: 100 }]
    const paperRect = { left: 30, top: 10 }
    const segments = rectsToSegments(merged, paperRect)
    expect(segments).toEqual([
      { x1: 20, x2: 70, y: 115 }, // left-30, right-30, bottom-10
    ])
  })

  it('returns empty array for empty input', () => {
    expect(rectsToSegments([], { left: 0, top: 0 })).toEqual([])
  })

  it('handles multiple merged rects', () => {
    const merged = [
      { top: 10, bottom: 25, left: 50, right: 100 },
      { top: 30, bottom: 45, left: 60, right: 110 },
    ]
    const paperRect = { left: 40, top: 5 }
    const segments = rectsToSegments(merged, paperRect)
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual({ x1: 10, x2: 60, y: 20 })
    expect(segments[1]).toEqual({ x1: 20, x2: 70, y: 40 })
  })
})
