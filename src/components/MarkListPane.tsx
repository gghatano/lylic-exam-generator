import type { AnswerType, DocumentState } from '../core/types.ts'
import type { Action } from '../hooks/useDocumentState.ts'
import { toCircledNumber, buildNumberByPosition } from '../core/marks.ts'
import { toKanjiNumber } from '../core/kanjiNumber.ts'

const ANSWER_TYPE_LABELS: { value: AnswerType; label: string }[] = [
  { value: 'long', label: '長文' },
  { value: 'short', label: '短文' },
  { value: 'word', label: '単語' },
  { value: 'choice', label: '選択肢' },
]

type MarkListPaneProps = {
  state: DocumentState
  dispatch: React.Dispatch<Action>
}

function AnswerTypeSelector({
  id,
  kind,
  answerType,
  choices,
  dispatch,
}: {
  id: string
  kind: 'mark' | 'fq'
  answerType: AnswerType
  choices: string[]
  dispatch: React.Dispatch<Action>
}) {
  const handleTypeChange = (value: AnswerType) => {
    if (kind === 'mark') {
      dispatch({ type: 'UPDATE_MARK_ANSWER_TYPE', markId: id, answerType: value })
    } else {
      dispatch({ type: 'UPDATE_FREE_QUESTION_ANSWER_TYPE', id, answerType: value })
    }
  }

  return (
    <div className="answer-type-section">
      <div className="answer-type-radios">
        <span className="answer-type-label">回答形式:</span>
        {ANSWER_TYPE_LABELS.map((opt) => (
          <label key={opt.value}>
            <input
              type="radio"
              name={`answer-type-${id}`}
              checked={answerType === opt.value}
              onChange={() => handleTypeChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {answerType === 'choice' && (
        <div className="choice-editor">
          {choices.map((ch, i) => (
            <div key={i} className="choice-row">
              <span className="choice-label">{String.fromCodePoint(0x30a2 + i * 2)}</span>
              <input
                type="text"
                value={ch}
                onChange={(e) =>
                  kind === 'mark'
                    ? dispatch({
                        type: 'UPDATE_MARK_CHOICE',
                        markId: id,
                        index: i,
                        value: e.target.value,
                      })
                    : dispatch({
                        type: 'UPDATE_FREE_QUESTION_CHOICE',
                        id,
                        index: i,
                        value: e.target.value,
                      })
                }
                placeholder={`選択肢${String.fromCodePoint(0x30a2 + i * 2)}`}
              />
              {choices.length > 2 && (
                <button
                  className="choice-remove"
                  onClick={() =>
                    kind === 'mark'
                      ? dispatch({ type: 'REMOVE_MARK_CHOICE', markId: id, index: i })
                      : dispatch({ type: 'REMOVE_FREE_QUESTION_CHOICE', id, index: i })
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {choices.length < 6 && (
            <button
              className="choice-add"
              onClick={() =>
                kind === 'mark'
                  ? dispatch({ type: 'ADD_MARK_CHOICE', markId: id })
                  : dispatch({ type: 'ADD_FREE_QUESTION_CHOICE', id })
              }
            >
              + 選択肢を追加
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function MarkListPane({ state, dispatch }: MarkListPaneProps) {
  const { marks, freeQuestions, questionOrder } = state

  const handleClearAll = () => {
    const ok = window.confirm('すべての傍線部と設問を削除しますか？')
    if (ok) {
      dispatch({ type: 'CLEAR_MARKS' })
    }
  }

  const numberMap = buildNumberByPosition(marks)
  const markMap = new Map(marks.map((m) => [m.id, m]))
  const fqMap = new Map(freeQuestions.map((fq) => [fq.id, fq]))

  return (
    <div className="right-pane">
      <h2>設問一覧</h2>

      {questionOrder.length === 0 ? (
        <div className="empty-state">傍線部がありません</div>
      ) : (
        <>
          {questionOrder.map((id, orderIdx) => {
            const mark = markMap.get(id)
            const fq = fqMap.get(id)
            const questionNum = orderIdx + 1
            const isFirst = orderIdx === 0
            const isLast = orderIdx === questionOrder.length - 1

            if (mark) {
              const circledNum = numberMap.get(mark.id) ?? 1
              return (
                <div key={mark.id} className="mark-item">
                  <div className="mark-item-header">
                    <span className="circled-number">
                      {toCircledNumber(circledNum)} （問{toKanjiNumber(questionNum)}）
                    </span>
                    <div className="controls">
                      <button
                        disabled={isFirst}
                        onClick={() =>
                          dispatch({ type: 'REORDER_QUESTION', id: mark.id, direction: 'up' })
                        }
                      >
                        ↑
                      </button>
                      <button
                        disabled={isLast}
                        onClick={() =>
                          dispatch({ type: 'REORDER_QUESTION', id: mark.id, direction: 'down' })
                        }
                      >
                        ↓
                      </button>
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
                    placeholder={`下線部${toCircledNumber(circledNum)}について説明せよ。`}
                  />
                  <AnswerTypeSelector
                    id={mark.id}
                    kind="mark"
                    answerType={mark.answerType}
                    choices={mark.choices}
                    dispatch={dispatch}
                  />
                </div>
              )
            }

            if (fq) {
              return (
                <div key={fq.id} className="mark-item">
                  <div className="mark-item-header">
                    <span className="circled-number">問{toKanjiNumber(questionNum)}</span>
                    <div className="controls">
                      <button
                        disabled={isFirst}
                        onClick={() =>
                          dispatch({ type: 'REORDER_QUESTION', id: fq.id, direction: 'up' })
                        }
                      >
                        ↑
                      </button>
                      <button
                        disabled={isLast}
                        onClick={() =>
                          dispatch({ type: 'REORDER_QUESTION', id: fq.id, direction: 'down' })
                        }
                      >
                        ↓
                      </button>
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
                  <AnswerTypeSelector
                    id={fq.id}
                    kind="fq"
                    answerType={fq.answerType}
                    choices={fq.choices}
                    dispatch={dispatch}
                  />
                </div>
              )
            }

            return null
          })}

          <button className="btn-danger" onClick={handleClearAll}>
            全削除
          </button>
        </>
      )}

      <button
        className="btn-action"
        onClick={() => dispatch({ type: 'ADD_FREE_QUESTION' })}
      >
        設問を追加（下線なし）
      </button>
    </div>
  )
}
