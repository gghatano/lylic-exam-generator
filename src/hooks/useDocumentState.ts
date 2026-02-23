import { useReducer } from 'react'
import type { DocumentState, Layout } from '../core/types'
import {
  addFreeQuestion,
  addMark,
  createInitialState,
  isError,
  removeFreeQuestion,
  removeMark,
  setText,
  updateFreeQuestion,
  updateLayout,
  updateMarkQuestion,
  updateSource,
} from '../core/state'

export type Action =
  | { type: 'ADD_MARK'; start: number; end: number }
  | { type: 'REMOVE_MARK'; markId: string }
  | { type: 'UPDATE_QUESTION'; markId: string; question: string }
  | { type: 'UPDATE_LAYOUT'; partial: Partial<Layout> }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'CLEAR_MARKS' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_FREE_QUESTION' }
  | { type: 'REMOVE_FREE_QUESTION'; id: string }
  | { type: 'UPDATE_FREE_QUESTION'; id: string; question: string }
  | { type: 'SET_SOURCE'; source: string }

type ReducerResult = {
  state: DocumentState
  error: string | null
}

function reducer(current: ReducerResult, action: Action): ReducerResult {
  switch (action.type) {
    case 'ADD_MARK': {
      const result = addMark(current.state, action.start, action.end)
      if (isError(result)) {
        return { ...current, error: result.error }
      }
      return { state: result, error: null }
    }
    case 'REMOVE_MARK':
      return { state: removeMark(current.state, action.markId), error: null }
    case 'UPDATE_QUESTION':
      return {
        state: updateMarkQuestion(current.state, action.markId, action.question),
        error: null,
      }
    case 'UPDATE_LAYOUT':
      return { state: updateLayout(current.state, action.partial), error: null }
    case 'SET_TEXT':
      return { state: setText(current.state, action.text), error: null }
    case 'CLEAR_MARKS':
      return { state: { ...current.state, marks: [], freeQuestions: [] }, error: null }
    case 'CLEAR_ERROR':
      return { ...current, error: null }
    case 'ADD_FREE_QUESTION':
      return { state: addFreeQuestion(current.state), error: null }
    case 'REMOVE_FREE_QUESTION':
      return { state: removeFreeQuestion(current.state, action.id), error: null }
    case 'UPDATE_FREE_QUESTION':
      return {
        state: updateFreeQuestion(current.state, action.id, action.question),
        error: null,
      }
    case 'SET_SOURCE':
      return { state: updateSource(current.state, action.source), error: null }
  }
}

export function useDocumentState() {
  const [{ state, error }, dispatch] = useReducer(reducer, {
    state: createInitialState(),
    error: null,
  })

  return { state, error, dispatch }
}
