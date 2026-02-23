import type { Mark } from '../core/types.ts'
import { toCircledNumber, buildNumberByPosition } from '../core/marks.ts'
import { filterRects, mergeRectsByLine, rectsToSegments } from '../core/rects.ts'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Build a DOM Range from document offsets within textLayer.
 *
 * textLayer.childNodes is a flat sequence of:
 *   TextNode, BR, TextNode, BR, ..., TextNode
 * where each BR represents a \n (offset +1) and each TextNode contains one line's text.
 */
export function buildDomRange(
  start: number,
  end: number,
  textLayer: HTMLElement,
): Range | null {
  const range = document.createRange()
  let offset = 0
  let startSet = false
  let endSet = false
  const children = textLayer.childNodes

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child.nodeName === 'BR') {
      // BR represents a newline character (\n) at this offset
      if (!startSet && start === offset) {
        range.setStartBefore(child)
        startSet = true
      }
      if (!endSet && end === offset) {
        range.setEndBefore(child)
        endSet = true
      }
      offset += 1
      continue
    }

    // It's a TextNode (nodeType === 3)
    const len = child.textContent?.length ?? 0

    if (!startSet && start >= offset && start <= offset + len) {
      range.setStart(child, start - offset)
      startSet = true
    }
    if (!endSet && end >= offset && end <= offset + len) {
      range.setEnd(child, end - offset)
      endSet = true
    }

    offset += len
  }

  if (!startSet || !endSet) return null
  return range
}

export function renderOverlay(
  marks: Mark[],
  textLayer: HTMLElement,
  bodyAreaEl: HTMLElement,
  overlayEl: SVGSVGElement,
): void {
  // Clear overlay
  while (overlayEl.firstChild) {
    overlayEl.removeChild(overlayEl.firstChild)
  }

  // Set overlay dimensions to match body-area (the positioning context)
  const areaWidth = bodyAreaEl.offsetWidth
  const areaHeight = bodyAreaEl.offsetHeight
  overlayEl.setAttribute('viewBox', `0 0 ${areaWidth} ${areaHeight}`)
  overlayEl.setAttribute('width', String(areaWidth))
  overlayEl.setAttribute('height', String(areaHeight))

  if (marks.length === 0) return

  // Use body-area as coordinate origin since the SVG is positioned within it
  const bodyAreaRect = bodyAreaEl.getBoundingClientRect()

  // Number marks by their position in the text (start offset order)
  const numberMap = buildNumberByPosition(marks)

  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i]
    const domRange = buildDomRange(mark.start, mark.end, textLayer)
    if (!domRange) continue

    const clientRects = Array.from(domRange.getClientRects())
    const filtered = filterRects(clientRects as DOMRect[])
    const merged = mergeRectsByLine(filtered)
    const segments = rectsToSegments(merged, bodyAreaRect)

    for (let j = 0; j < segments.length; j++) {
      const seg = segments[j]
      const line = document.createElementNS(SVG_NS, 'line')
      line.setAttribute('x1', String(seg.x1))
      line.setAttribute('y1', String(seg.y))
      line.setAttribute('x2', String(seg.x2))
      line.setAttribute('y2', String(seg.y))
      line.setAttribute('stroke', 'black')
      line.setAttribute('stroke-width', '2')
      overlayEl.appendChild(line)

      // Add circled number on the first segment (at the start)
      if (j === 0) {
        const text = document.createElementNS(SVG_NS, 'text')
        text.setAttribute('x', String(seg.x1 - 14))
        text.setAttribute('y', String(seg.y - 6))
        text.setAttribute('font-size', '12')
        text.textContent = toCircledNumber(numberMap.get(mark.id) ?? i + 1)
        overlayEl.appendChild(text)
      }
    }
  }
}
