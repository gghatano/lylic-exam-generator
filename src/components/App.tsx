import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/paper.css'
import { useDocumentState } from '../hooks/useDocumentState.ts'
import { getSelectionOffsets } from '../adapters/selection.ts'
import { renderOverlay } from '../adapters/overlay.ts'
import { exportPaper } from '../adapters/export.ts'
import { InputPane } from './InputPane.tsx'
import { Paper } from './Paper.tsx'
import { MarkListPane } from './MarkListPane.tsx'
import { SelectionPopup } from './SelectionPopup.tsx'
import { Toast } from './Toast.tsx'

type MobileTab = 'input' | 'preview' | 'questions'

function App() {
  const { state, error, dispatch } = useDocumentState()

  const paperRef = useRef<HTMLDivElement | null>(null)
  const bodyAreaRef = useRef<HTMLDivElement | null>(null)
  const textLayerRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<SVGSVGElement | null>(null)

  const [activeTab, setActiveTab] = useState<MobileTab>('preview')
  const [popup, setPopup] = useState<{ x: number; y: number; start: number; end: number } | null>(
    null,
  )

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [dispatch])

  // Render overlay
  const doRenderOverlay = useCallback(() => {
    const textLayer = textLayerRef.current
    const bodyAreaEl = bodyAreaRef.current
    const overlayEl = overlayRef.current
    if (!textLayer || !bodyAreaEl || !overlayEl) return

    renderOverlay(state.marks, textLayer, bodyAreaEl, overlayEl)
  }, [state.marks])

  // Re-render overlay on dependencies change
  useEffect(() => {
    const id = requestAnimationFrame(doRenderOverlay)
    return () => cancelAnimationFrame(id)
  }, [doRenderOverlay, state.text, state.layout])

  // Re-render overlay on window resize (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(doRenderOverlay, 200)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [doRenderOverlay])

  // Re-render overlay on fonts ready
  useEffect(() => {
    document.fonts.ready.then(() => {
      doRenderOverlay()
    })
  }, [doRenderOverlay])

  // Handle mouseup for selection
  const handleMouseUp = useCallback(() => {
    const textLayer = textLayerRef.current
    if (!textLayer) return

    setTimeout(() => {
      const offsets = getSelectionOffsets(textLayer)
      if (!offsets) {
        setPopup(null)
        return
      }

      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return

      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setPopup({
        x: rect.left + rect.width / 2 - 50,
        y: rect.top - 40,
        start: offsets.start,
        end: offsets.end,
      })
    }, 10)
  }, [])

  const handleAddMark = useCallback(() => {
    if (!popup) return
    dispatch({ type: 'ADD_MARK', start: popup.start, end: popup.end })
    window.getSelection()?.removeAllRanges()
    setPopup(null)
  }, [popup, dispatch])

  // PNG export
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    const paperEl = paperRef.current
    if (!paperEl) return
    setExporting(true)
    setExportError(null)
    try {
      doRenderOverlay()
      await exportPaper(paperEl, state.layout.exportScale)
    } catch {
      setExportError('ブラウザの制約で失敗しました。別ブラウザでお試しください')
    } finally {
      setExporting(false)
    }
  }, [doRenderOverlay, state.layout.exportScale])

  // Hide popup on mousedown outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.selection-popup')) return
      setPopup(null)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div className="app" data-active-tab={activeTab}>
      <div className="mobile-tabs">
        <button
          className={activeTab === 'input' ? 'active' : ''}
          onClick={() => setActiveTab('input')}
        >
          入力
        </button>
        <button
          className={activeTab === 'preview' ? 'active' : ''}
          onClick={() => setActiveTab('preview')}
        >
          プレビュー
        </button>
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => setActiveTab('questions')}
        >
          設問
        </button>
      </div>

      <InputPane state={state} dispatch={dispatch} onExport={handleExport} exporting={exporting} />

      <div className="center-pane" onMouseUp={handleMouseUp}>
        <Paper
          state={state}
          paperRef={paperRef}
          bodyAreaRef={bodyAreaRef}
          textLayerRef={textLayerRef}
          overlayRef={overlayRef}
        />
      </div>

      <MarkListPane state={state} dispatch={dispatch} />

      {popup && <SelectionPopup x={popup.x} y={popup.y} onAdd={handleAddMark} />}

      {error && <Toast message={error} onClose={clearError} />}
      {exportError && <Toast message={exportError} onClose={() => setExportError(null)} />}
    </div>
  )
}

export default App
