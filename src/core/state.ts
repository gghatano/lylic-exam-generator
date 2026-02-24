import type { AnswerType, DocumentState, FreeQuestion, Layout, Mark } from './types'
import { buildExcerpt, isOverlapping } from './marks'

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function generateMarkId(): string {
  return `m_${randomId()}`
}

export function generateFreeQuestionId(): string {
  return `fq_${randomId()}`
}

/** @deprecated No-op: IDs are now random */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resetMarkIdCounter(_n = 1): void {
  // no-op
}

export const DEFAULT_LAYOUT: Layout = {
  paperWidthPx: 794,
  paperHeightPx: 1123,
  marginPx: { top: 60, right: 60, bottom: 60, left: 60 },
  fontSizePx: 18,
  lineHeight: 1.7,
  showLineNumbers: false,
  exportScale: 2,
}

// Tutorial sample text with 3 spaces inserted before each underline
const SAMPLE_TEXT = [
  'このツールでは、   国語の試験問題を作成できます。',
  '左の入力欄にテキストを入力し「反映」ボタンを押すと、ここに本文が表示されます。',
  '本文中の   テキストをドラッグで選択すると、下線と番号が付きます。',
  '右側の設問一覧で、各問題の問題文を編集できます。',
].join('\n')

export function createInitialState(): DocumentState {
  // Pre-populate with tutorial sample marks
  // Positions account for the 3-space padding before each underline
  const marks: Mark[] = [
    {
      id: generateMarkId(),
      start: 11,
      end: 18,
      excerpt: buildExcerpt(SAMPLE_TEXT, 11, 18),
      question: '下線部①「国語の試験問題」とはどのようなものか、具体例を挙げて説明せよ。',
      answerType: 'long',
      choices: [],
    },
    {
      id: generateMarkId(),
      start: 74,
      end: 86,
      excerpt: buildExcerpt(SAMPLE_TEXT, 74, 86),
      question: '下線部②「テキストをドラッグで選択」の操作手順を説明せよ。',
      answerType: 'long',
      choices: [],
    },
  ]

  return {
    text: SAMPLE_TEXT,
    marks,
    freeQuestions: [],
    questionOrder: marks.map((m) => m.id),
    layout: { ...DEFAULT_LAYOUT },
    source: '（使い方ガイド）',
  }
}

const SPACE_INSERT = '   ' // 3 half-width spaces inserted before underline start

export function addMark(
  state: DocumentState,
  start: number,
  end: number,
): DocumentState | { error: string } {
  if (start >= end) {
    return { error: '選択範囲が空です' }
  }

  if (state.marks.length >= 30) {
    return { error: '傍線部は最大30個までです' }
  }

  const overlap = state.marks.find((m) => isOverlapping({ start, end }, m))
  if (overlap) {
    return { error: '既存の傍線部と重なっています' }
  }

  // Insert 3 spaces before the underline start to make room for the circled number
  const insertAt = start
  const shift = SPACE_INSERT.length
  const newText = state.text.slice(0, insertAt) + SPACE_INSERT + state.text.slice(insertAt)

  // Shift existing marks affected by the insertion
  const shiftedMarks = state.marks.map((m) => {
    let newStart = m.start
    let newEnd = m.end
    if (m.start >= insertAt) {
      newStart += shift
      newEnd += shift
    } else if (m.end > insertAt) {
      newEnd += shift
    }
    if (newStart === m.start && newEnd === m.end) return m
    return {
      ...m,
      start: newStart,
      end: newEnd,
      excerpt: buildExcerpt(newText, newStart, newEnd),
    }
  })

  const mark: Mark = {
    id: generateMarkId(),
    start: start + shift,
    end: end + shift,
    excerpt: buildExcerpt(newText, start + shift, end + shift),
    question: '',
    answerType: 'long',
    choices: [],
  }

  return {
    ...state,
    text: newText,
    marks: [...shiftedMarks, mark],
    questionOrder: [...state.questionOrder, mark.id],
  }
}

export function removeMark(state: DocumentState, markId: string): DocumentState {
  return {
    ...state,
    marks: state.marks.filter((m) => m.id !== markId),
    questionOrder: state.questionOrder.filter((id) => id !== markId),
  }
}

export function addFreeQuestion(state: DocumentState): DocumentState {
  const fq: FreeQuestion = {
    id: generateFreeQuestionId(),
    question: '',
    answerType: 'long',
    choices: [],
  }
  return {
    ...state,
    freeQuestions: [...state.freeQuestions, fq],
    questionOrder: [...state.questionOrder, fq.id],
  }
}

export function removeFreeQuestion(state: DocumentState, id: string): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.filter((fq) => fq.id !== id),
    questionOrder: state.questionOrder.filter((qid) => qid !== id),
  }
}

export function updateFreeQuestion(
  state: DocumentState,
  id: string,
  question: string,
): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.map((fq) => (fq.id === id ? { ...fq, question } : fq)),
  }
}

export function updateSource(state: DocumentState, source: string): DocumentState {
  return { ...state, source }
}

export function updateMarkQuestion(
  state: DocumentState,
  markId: string,
  question: string,
): DocumentState {
  return {
    ...state,
    marks: state.marks.map((m) => (m.id === markId ? { ...m, question } : m)),
  }
}

export function updateLayout(state: DocumentState, partial: Partial<Layout>): DocumentState {
  return {
    ...state,
    layout: { ...state.layout, ...partial },
  }
}

export function setText(state: DocumentState, text: string): DocumentState {
  const normalized = text.replace(/\r\n/g, '\n')
  return {
    ...state,
    text: normalized,
    marks: [],
    freeQuestions: [],
    questionOrder: [],
  }
}

export function reorderQuestion(
  state: DocumentState,
  id: string,
  direction: 'up' | 'down',
): DocumentState {
  const order = [...state.questionOrder]
  const idx = order.indexOf(id)
  if (idx < 0) return state
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= order.length) return state
  ;[order[idx], order[swapIdx]] = [order[swapIdx], order[idx]]
  return { ...state, questionOrder: order }
}

// --- answerType / choices functions ---

const DEFAULT_CHOICES = ['', '', '', '']

function switchAnswerType(
  current: AnswerType,
  next: AnswerType,
  currentChoices: string[],
): string[] {
  if (next === 'choice' && current !== 'choice') return [...DEFAULT_CHOICES]
  if (next !== 'choice' && current === 'choice') return []
  return currentChoices
}

export function updateMarkAnswerType(
  state: DocumentState,
  markId: string,
  answerType: AnswerType,
): DocumentState {
  return {
    ...state,
    marks: state.marks.map((m) =>
      m.id === markId
        ? { ...m, answerType, choices: switchAnswerType(m.answerType, answerType, m.choices) }
        : m,
    ),
  }
}

export function updateFreeQuestionAnswerType(
  state: DocumentState,
  id: string,
  answerType: AnswerType,
): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.map((fq) =>
      fq.id === id
        ? { ...fq, answerType, choices: switchAnswerType(fq.answerType, answerType, fq.choices) }
        : fq,
    ),
  }
}

export function updateMarkChoice(
  state: DocumentState,
  markId: string,
  index: number,
  value: string,
): DocumentState {
  return {
    ...state,
    marks: state.marks.map((m) => {
      if (m.id !== markId) return m
      const choices = [...m.choices]
      choices[index] = value
      return { ...m, choices }
    }),
  }
}

export function updateFreeQuestionChoice(
  state: DocumentState,
  id: string,
  index: number,
  value: string,
): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.map((fq) => {
      if (fq.id !== id) return fq
      const choices = [...fq.choices]
      choices[index] = value
      return { ...fq, choices }
    }),
  }
}

export function addMarkChoice(state: DocumentState, markId: string): DocumentState {
  return {
    ...state,
    marks: state.marks.map((m) => {
      if (m.id !== markId || m.choices.length >= 6) return m
      return { ...m, choices: [...m.choices, ''] }
    }),
  }
}

export function addFreeQuestionChoice(state: DocumentState, id: string): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.map((fq) => {
      if (fq.id !== id || fq.choices.length >= 6) return fq
      return { ...fq, choices: [...fq.choices, ''] }
    }),
  }
}

export function removeMarkChoice(state: DocumentState, markId: string, index: number): DocumentState {
  return {
    ...state,
    marks: state.marks.map((m) => {
      if (m.id !== markId || m.choices.length <= 2) return m
      return { ...m, choices: m.choices.filter((_, i) => i !== index) }
    }),
  }
}

export function removeFreeQuestionChoice(
  state: DocumentState,
  id: string,
  index: number,
): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.map((fq) => {
      if (fq.id !== id || fq.choices.length <= 2) return fq
      return { ...fq, choices: fq.choices.filter((_, i) => i !== index) }
    }),
  }
}

export function isError(result: DocumentState | { error: string }): result is { error: string } {
  return 'error' in result
}
