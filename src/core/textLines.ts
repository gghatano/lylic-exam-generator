import type { RenderedLineInfo } from './types.ts'

/**
 * Split text by newlines and compute start/end offsets for each line.
 * Uses end-exclusive convention: end = start + lineText.length.
 * The newline character itself is NOT included in the range.
 */
export function buildRenderedLines(text: string): RenderedLineInfo[] {
  const parts = text.split('\n')
  const lines: RenderedLineInfo[] = []
  let offset = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const hasNewline = i < parts.length - 1
    lines.push({
      start: offset,
      end: offset + part.length,
      hasNewline,
    })
    // Advance past the line content + the newline character
    offset += part.length + 1
  }

  return lines
}

/**
 * Find the index of the line that contains the given offset.
 * Uses start <= offset < end for non-empty lines.
 * For empty lines (start === end), matches when offset === start.
 * Returns -1 if not found.
 */
export function findLineByOffset(
  lines: RenderedLineInfo[],
  offset: number,
): number {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.start === line.end) {
      // Empty line
      if (offset === line.start) return i
    } else {
      if (offset >= line.start && offset < line.end) return i
    }
  }
  return -1
}

/**
 * If the offset falls on a newline character position, clamp it back
 * to the end of the line content. If offset exceeds all lines,
 * clamp to the end of the last line. Otherwise return as-is.
 */
export function clampOffsetToLine(
  lines: RenderedLineInfo[],
  offset: number,
): number {
  if (lines.length === 0) return offset

  // Check if offset is on a newline character position
  for (const line of lines) {
    if (line.hasNewline && offset === line.end) {
      return line.end
    }
  }

  // Clamp if beyond last line
  const lastLine = lines[lines.length - 1]
  if (offset > lastLine.end) {
    return lastLine.end
  }

  return offset
}
