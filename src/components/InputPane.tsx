import { useState } from 'react'
import type { DocumentState } from '../core/types.ts'
import type { Action } from '../hooks/useDocumentState.ts'

type InputPaneProps = {
  state: DocumentState
  dispatch: React.Dispatch<Action>
  onExport: () => void
  exporting: boolean
}

export function InputPane({ state, dispatch, onExport, exporting }: InputPaneProps) {
  const [inputText, setInputText] = useState(state.text)
  const [inputSource, setInputSource] = useState(state.source)

  const handleApply = () => {
    if (state.marks.length > 0) {
      const ok = window.confirm('本文を反映すると傍線部がリセットされます。よろしいですか？')
      if (!ok) return
    }
    dispatch({ type: 'SET_TEXT', text: inputText })
  }

  return (
    <div className="left-pane">
      <h2>入力</h2>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="歌詞・本文を入力..."
      />
      <div className="setting-row" style={{ marginTop: '8px' }}>
        <label>出典</label>
        <input
          type="text"
          value={inputSource}
          onChange={(e) => {
            setInputSource(e.target.value)
            dispatch({ type: 'SET_SOURCE', source: e.target.value })
          }}
          placeholder="（例：清少納言『枕草子』）"
        />
      </div>
      <div>
        <button className="btn btn-primary" onClick={handleApply}>
          反映
        </button>
      </div>

      <div className="settings-section">
        <h3>設定</h3>

        <div className="setting-row">
          <label>文字サイズ</label>
          <input
            type="number"
            value={state.layout.fontSizePx}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: { fontSizePx: Number(e.target.value) },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>行間</label>
          <input
            type="number"
            step={0.1}
            value={state.layout.lineHeight}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: { lineHeight: Number(e.target.value) },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>余白(上)</label>
          <input
            type="number"
            value={state.layout.marginPx.top}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: { marginPx: { ...state.layout.marginPx, top: Number(e.target.value) } },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>余白(右)</label>
          <input
            type="number"
            value={state.layout.marginPx.right}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: {
                  marginPx: { ...state.layout.marginPx, right: Number(e.target.value) },
                },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>余白(下)</label>
          <input
            type="number"
            value={state.layout.marginPx.bottom}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: {
                  marginPx: { ...state.layout.marginPx, bottom: Number(e.target.value) },
                },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>余白(左)</label>
          <input
            type="number"
            value={state.layout.marginPx.left}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LAYOUT',
                partial: {
                  marginPx: { ...state.layout.marginPx, left: Number(e.target.value) },
                },
              })
            }
          />
        </div>

        <div className="setting-row">
          <label>
            <input
              type="checkbox"
              checked={state.layout.showLineNumbers}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_LAYOUT',
                  partial: { showLineNumbers: e.target.checked },
                })
              }
            />
            行番号
          </label>
        </div>

        <div className="setting-row">
          <label>出力倍率</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="exportScale"
                checked={state.layout.exportScale === 1}
                onChange={() =>
                  dispatch({
                    type: 'UPDATE_LAYOUT',
                    partial: { exportScale: 1 },
                  })
                }
              />
              1x
            </label>
            <label>
              <input
                type="radio"
                name="exportScale"
                checked={state.layout.exportScale === 2}
                onChange={() =>
                  dispatch({
                    type: 'UPDATE_LAYOUT',
                    partial: { exportScale: 2 },
                  })
                }
              />
              2x
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <button className="btn btn-primary" onClick={onExport} disabled={exporting}>
          {exporting ? '出力中...' : 'PNG出力'}
        </button>
      </div>
    </div>
  )
}
