import { type RefObject, useEffect } from 'react'
import type { DocumentState } from '../core/types.ts'
import { toKanjiNumber } from '../core/kanjiNumber.ts'
import { toCircledNumber, buildNumberByPosition } from '../core/marks.ts'

type PaperProps = {
  state: DocumentState
  paperRef: RefObject<HTMLDivElement | null>
  bodyAreaRef: RefObject<HTMLDivElement | null>
  textLayerRef: RefObject<HTMLDivElement | null>
  overlayRef: RefObject<SVGSVGElement | null>
}

/**
 * Imperatively render text into textLayer as flat TextNode + <br> structure.
 * This matches the expectation of selection.ts and overlay.ts:
 *   textLayer.childNodes = [TextNode, BR, TextNode, BR, ..., TextNode]
 */
function renderTextLayer(textLayerEl: HTMLDivElement, text: string) {
  textLayerEl.textContent = ''
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      textLayerEl.appendChild(document.createElement('br'))
    }
    textLayerEl.appendChild(document.createTextNode(lines[i]))
  }
}

export function Paper({ state, paperRef, bodyAreaRef, textLayerRef, overlayRef }: PaperProps) {
  const { text, marks, freeQuestions, layout, source } = state
  const { paperWidthPx, paperHeightPx, marginPx, fontSizePx, lineHeight, showLineNumbers } = layout

  const lines = text.split('\n')

  const bodyWidth = paperWidthPx - marginPx.left - marginPx.right
  const lineNumberWidth = showLineNumbers ? 30 : 0

  // Imperatively render text to keep flat TextNode + BR structure
  useEffect(() => {
    if (textLayerRef.current) {
      renderTextLayer(textLayerRef.current, text)
    }
  }, [text, textLayerRef])

  const numberMap = buildNumberByPosition(marks)
  const sorted = [...marks].sort((a, b) => a.start - b.start)
  const markCount = marks.length

  return (
    <div
      id="paper"
      className="paper"
      ref={paperRef}
      style={{
        width: paperWidthPx,
        minHeight: paperHeightPx,
        padding: `${marginPx.top}px ${marginPx.right}px ${marginPx.bottom}px ${marginPx.left}px`,
        fontSize: fontSizePx,
        lineHeight,
      }}
    >
      <div className="body-area" ref={bodyAreaRef} style={{ position: 'relative' }}>
        {showLineNumbers && (
          <div
            className="line-numbers"
            style={{
              width: lineNumberWidth,
              lineHeight,
              fontSize: 12,
            }}
          >
            {lines.map((_, i) => (
              <span
                key={i}
                className="line-number"
                style={{
                  height: `${fontSizePx * lineHeight}px`,
                  lineHeight: `${fontSizePx * lineHeight}px`,
                }}
              >
                {i + 1}
              </span>
            ))}
          </div>
        )}
        <div
          className="text-layer"
          ref={textLayerRef}
          style={{
            marginLeft: lineNumberWidth,
            width: bodyWidth - lineNumberWidth,
          }}
        />
        <svg className="overlay" ref={overlayRef} />
      </div>

      {source && (
        <div className="source-line" style={{ textAlign: 'right', marginTop: '0.5em' }}>
          {source}
        </div>
      )}

      {!text && (
        <div className="paper-guide">
          左ペインにテキストを入力し「反映」を押してください。
          <br />
          本文をドラッグ選択 → 「傍線部に追加」で傍線が引けます。
        </div>
      )}

      {(marks.length > 0 || freeQuestions.length > 0) && (
        <div className="question-area">
          {sorted.map((mark) => {
            const num = numberMap.get(mark.id) ?? 1
            return (
              <div key={mark.id} className="question-item">
                <div className="question-heading">問{toKanjiNumber(num)}</div>
                <div className="question-text">
                  {mark.question || `下線部${toCircledNumber(num)}について説明せよ。`}
                </div>
              </div>
            )
          })}
          {freeQuestions.map((fq, i) => {
            const num = markCount + i + 1
            return (
              <div key={fq.id} className="question-item">
                <div className="question-heading">問{toKanjiNumber(num)}</div>
                <div className="question-text">
                  {fq.question || '（問題文を入力してください）'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
