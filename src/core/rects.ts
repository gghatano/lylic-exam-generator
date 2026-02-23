import type { MergedRect, Segment } from './types.ts'

/**
 * Filter out rects that are too small to be meaningful
 * (width < 1 or height < 1).
 */
export function filterRects(rects: DOMRect[]): DOMRect[] {
  return rects.filter((r) => r.width >= 1 && r.height >= 1)
}

/**
 * Group rects by similar top coordinate (within tolY pixels),
 * then merge each group into a single MergedRect.
 * Result is sorted by top ascending.
 */
export function mergeRectsByLine(
  rects: DOMRect[],
  tolY = 2,
): MergedRect[] {
  if (rects.length === 0) return []

  // Sort by top for grouping
  const sorted = [...rects].sort((a, b) => a.top - b.top)

  const groups: DOMRect[][] = []
  let currentGroup: DOMRect[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const rect = sorted[i]
    // Compare against the first rect of current group
    if (Math.abs(rect.top - currentGroup[0].top) < tolY) {
      currentGroup.push(rect)
    } else {
      groups.push(currentGroup)
      currentGroup = [rect]
    }
  }
  groups.push(currentGroup)

  const merged: MergedRect[] = groups.map((group) => ({
    top: Math.min(...group.map((r) => r.top)),
    bottom: Math.max(...group.map((r) => r.bottom)),
    left: Math.min(...group.map((r) => r.left)),
    right: Math.max(...group.map((r) => r.right)),
  }))

  return merged.sort((a, b) => a.top - b.top)
}

/**
 * Convert MergedRects to Segments by translating coordinates
 * relative to a paper rect origin.
 */
export function rectsToSegments(
  mergedRects: MergedRect[],
  paperRect: { left: number; top: number },
): Segment[] {
  return mergedRects.map((r) => ({
    x1: r.left - paperRect.left,
    x2: r.right - paperRect.left,
    y: r.bottom - paperRect.top,
  }))
}
