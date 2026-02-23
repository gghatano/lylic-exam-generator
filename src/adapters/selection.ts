export function getSelectionOffsets(
  textLayer: HTMLElement,
): { start: number; end: number } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null

  const range = sel.getRangeAt(0)

  // Check that selection is within textLayer
  if (
    !textLayer.contains(range.startContainer) ||
    !textLayer.contains(range.endContainer)
  ) {
    return null
  }

  const start = calculateOffset(textLayer, range.startContainer, range.startOffset)
  const end = calculateOffset(textLayer, range.endContainer, range.endOffset)

  if (start === null || end === null || start >= end) return null
  return { start, end }
}

/**
 * Calculate document offset from a DOM point within textLayer.
 *
 * textLayer.childNodes is a flat sequence of:
 *   TextNode, BR, TextNode, BR, ..., TextNode
 * where each BR represents a \n (offset +1) and each TextNode contains one line's text.
 */
function calculateOffset(
  textLayer: HTMLElement,
  targetNode: Node,
  targetOffset: number,
): number | null {
  let offset = 0
  const children = textLayer.childNodes

  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    if (child.nodeName === 'BR') {
      if (child === targetNode) {
        return offset
      }
      offset += 1
      continue
    }

    // It's a TextNode (nodeType === 3)
    if (child.nodeType === 3) {
      const len = child.textContent?.length ?? 0
      if (child === targetNode) {
        return offset + targetOffset
      }
      offset += len
      continue
    }

    // Shouldn't happen with our flat structure, but handle gracefully
    const textContent = child.textContent ?? ''
    if (child === targetNode || child.contains(targetNode)) {
      return offset + targetOffset
    }
    offset += textContent.length
  }

  return null
}
