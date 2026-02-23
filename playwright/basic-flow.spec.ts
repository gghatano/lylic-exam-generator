import { test, expect } from '@playwright/test'

test('basic flow: input text, add underline mark, verify question pane', async ({ page }) => {
  await page.goto('/')

  // Step 1: Enter text in the textarea
  const textarea = page.locator('.left-pane textarea')
  await textarea.fill('春はあけぼの\nやうやう白くなりゆく\n山ぎはすこしあかりて')

  // Step 2: Click "反映" button (accept confirm dialog for clearing sample marks)
  page.on('dialog', (dialog) => dialog.accept())
  await page.click('button:has-text("反映")')

  // Step 3: Verify text appears in the paper
  const textLayer = page.locator('.text-layer')
  await expect(textLayer).toContainText('春はあけぼの')

  // Step 4: Select text programmatically
  // Flat structure: TextNode("春はあけぼの"), BR, TextNode("やうやう白くなりゆく"), ...
  await page.evaluate(() => {
    const textLayer = document.querySelector('.text-layer')
    if (!textLayer) throw new Error('text-layer not found')

    // First child is a TextNode containing the first line
    const firstTextNode = textLayer.childNodes[0]
    if (!firstTextNode || firstTextNode.nodeType !== 3) throw new Error('no text node')

    const range = document.createRange()
    range.setStart(firstTextNode, 0)
    range.setEnd(firstTextNode, 3) // Select first 3 chars "春はあ"

    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  })

  // Trigger mouseup on text layer to show popup
  await textLayer.dispatchEvent('mouseup')

  // Step 5: Wait for and click the "傍線部に追加" button in the selection popup
  const addButton = page.locator('.selection-popup button:has-text("傍線部に追加")')
  await expect(addButton).toBeVisible({ timeout: 5000 })
  await addButton.click()

  // Step 6: Verify mark appears in the right pane
  const markItem = page.locator('.mark-item')
  await expect(markItem).toHaveCount(1)

  // Step 7: Verify question textarea exists with placeholder
  const questionTextarea = markItem.locator('textarea')
  await expect(questionTextarea).toBeVisible()

  // Step 8: Enter a question
  await questionTextarea.fill('この表現の意味を説明せよ。')

  // Step 9: Verify question appears in the paper's question area
  const questionArea = page.locator('.question-area')
  await expect(questionArea).toContainText('問一')
  await expect(questionArea).toContainText('この表現の意味を説明せよ。')

  // Step 10: Verify PNG button is clickable (not disabled)
  const pngButton = page.locator('button:has-text("PNG出力")')
  await expect(pngButton).toBeEnabled()
})
