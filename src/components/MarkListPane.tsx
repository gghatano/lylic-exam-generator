import type { DocumentState } from '../core/types.ts'
import type { Action } from '../hooks/useDocumentState.ts'
import { toCircledNumber, buildNumberByPosition } from '../core/marks.ts'
import { toKanjiNumber } from '../core/kanjiNumber.ts'

type MarkListPaneProps = {
  state: DocumentState
  dispatch: React.Dispatch<Action>
}

export function MarkListPane({ state, dispatch }: MarkListPaneProps) {
  const { marks, freeQuestions } = state

  const handleClearAll = () => {
    const ok = window.confirm('すべての傍線部と設問を削除しますか？')
    if (ok) {
      dispatch({ type: 'CLEAR_MARKS' })
    }
  }

  const numberMap = buildNumberByPosition(marks)
  const markCount = marks.length

  return (
    <div className="right-pane">
      <h2>傍線部一覧</h2>

      {marks.length === 0 && freeQuestions.length === 0 ? (
        <div className="empty-state">傍線部がありません</div>
      ) : (
        <>
          {marks.map((mark) => {
            const num = numberMap.get(mark.id) ?? 1
            return (
              <div key={mark.id} className="mark-item">
                <div className="mark-item-header">
                  <span className="circled-number">{toCircledNumber(num)}</span>
                  <div className="controls">
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_MARK', markId: mark.id })}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="excerpt">{mark.excerpt}</div>
                <textarea
                  value={mark.question}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_QUESTION',
                      markId: mark.id,
                      question: e.target.value,
                    })
                  }
                  placeholder={`下線部${toCircledNumber(num)}について説明せよ。`}
                />
              </div>
            )
          })}

          {freeQuestions.map((fq, i) => {
            const num = markCount + i + 1
            return (
              <div key={fq.id} className="mark-item">
                <div className="mark-item-header">
                  <span className="circled-number">問{toKanjiNumber(num)}</span>
                  <div className="controls">
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_FREE_QUESTION', id: fq.id })}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <textarea
                  value={fq.question}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FREE_QUESTION',
                      id: fq.id,
                      question: e.target.value,
                    })
                  }
                  placeholder="問題文を入力..."
                />
              </div>
            )
          })}

          <button className="btn-danger" onClick={handleClearAll}>
            全削除
          </button>
        </>
      )}

      <button
        className="btn btn-secondary"
        style={{ marginTop: '8px' }}
        onClick={() => dispatch({ type: 'ADD_FREE_QUESTION' })}
      >
        設問を追加（下線なし）
      </button>
    </div>
  )
}
