/**
 * Convert a number (1-30) to its circled Unicode character.
 * 1→① ... 20→⑳, 21→㉑ ... 30→㉚
 */
export function toCircledNumber(n: number): string {
  if (n < 1 || n > 30 || !Number.isInteger(n)) {
    throw new RangeError(`n must be an integer between 1 and 30, got ${n}`)
  }
  if (n <= 20) {
    // U+2460 (①) is codepoint for 1, U+2461 for 2, etc.
    return String.fromCodePoint(0x2460 + n - 1)
  }
  // U+3251 (㉑) is codepoint for 21, U+3252 for 22, etc.
  return String.fromCodePoint(0x3251 + n - 21)
}

/**
 * Returns true if ranges a and b overlap (half-open interval semantics).
 * Adjacent ranges (e.g. [0,3) and [3,6)) do NOT overlap.
 */
export function isOverlapping(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end
}

/**
 * Build a map from mark id to its display number (1-based),
 * where numbering follows the order of appearance in the text (by `start` offset).
 */
export function buildNumberByPosition(marks: { id: string; start: number }[]): Map<string, number> {
  const sorted = [...marks].sort((a, b) => a.start - b.start)
  const map = new Map<string, number>()
  sorted.forEach((m, i) => map.set(m.id, i + 1))
  return map
}

/**
 * Build an excerpt string from a text range.
 * Replaces newlines with spaces, trims whitespace,
 * and truncates to maxLen with "…" appended if needed.
 */
export function buildExcerpt(
  text: string,
  start: number,
  end: number,
  maxLen = 40,
): string {
  const raw = text.slice(start, end)
  const cleaned = raw.replace(/\n/g, ' ').trim()
  if (cleaned.length <= maxLen) {
    return cleaned
  }
  return cleaned.slice(0, maxLen) + '\u2026'
}
