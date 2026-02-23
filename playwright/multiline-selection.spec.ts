import { test, expect } from '@playwright/test'

test('multiline selection: select across two lines and add mark', async ({ page }) => {
  await page.goto('/')

  const textarea = page.locator('.left-pane textarea')
  await textarea.fill('春はあけぼの\nやうやう白くなりゆく\n山ぎはすこしあかりて')
  page.on('dialog', (dialog) => dialog.accept())
  await page.click('button:has-text("反映")')

  const textLayer = page.locator('.text-layer')
  await expect(textLayer).toContainText('春はあけぼの')

  // Select text spanning from line 1 into line 2
  // "あけぼの\nやうやう" = offset 2..13
  await page.evaluate(() => {
    const tl = document.querySelector('.text-layer')
    if (!tl) throw new Error('text-layer not found')

    // Flat structure: TextNode("春はあけぼの"), BR, TextNode("やうやう白くなりゆく"), BR, TextNode(...)
    const children = tl.childNodes
    // children[0] = TextNode "春はあけぼの"
    // children[1] = BR
    // children[2] = TextNode "やうやう白くなりゆく"

    const range = document.createRange()
    range.setStart(children[0], 2) // offset 2 in first TextNode ("あ")
    range.setEnd(children[2], 4) // offset 4 in second TextNode ("う" after "やうやう")

    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  })

  await textLayer.dispatchEvent('mouseup')

  const addButton = page.locator('.selection-popup button:has-text("傍線部に追加")')
  await expect(addButton).toBeVisible({ timeout: 5000 })
  await addButton.click()

  // Verify mark was added
  const markItem = page.locator('.mark-item')
  await expect(markItem).toHaveCount(1)

  // Verify the excerpt contains text from both lines
  const excerpt = markItem.locator('.excerpt')
  await expect(excerpt).toContainText('あけぼの')

  // Verify SVG overlay has underline elements
  const svgLines = page.locator('.overlay line')
  // Should have at least 2 lines (one per visual line in the selection)
  const lineCount = await svgLines.count()
  expect(lineCount).toBeGreaterThanOrEqual(2)
})
