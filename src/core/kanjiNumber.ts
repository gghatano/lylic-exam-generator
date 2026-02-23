const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const

export function toKanjiNumber(n: number): string {
  if (n <= 0 || n > 30) return String(n)
  if (n <= 10) return KANJI[n - 1]
  if (n === 20) return '二十'
  if (n < 20) return '十' + KANJI[n - 11]
  if (n < 30) return '二十' + KANJI[n - 21]
  return '三十'
}
