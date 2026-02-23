import { toBlob } from 'html-to-image'

function formatDatetime(): string {
  const now = new Date()
  const y = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${y}${mo}${d}_${h}${mi}${s}`
}

export async function exportPaper(paperEl: HTMLElement, scale: 1 | 2): Promise<void> {
  await document.fonts.ready

  const blob = await toBlob(paperEl, {
    pixelRatio: scale,
    backgroundColor: '#ffffff',
  })

  if (!blob) {
    throw new Error('PNG生成に失敗しました')
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `exam_like_${formatDatetime()}.png`
  a.click()
  URL.revokeObjectURL(url)
}
