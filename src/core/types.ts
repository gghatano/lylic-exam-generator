export type AnswerType = 'long' | 'short' | 'word' | 'choice'

export type Mark = {
  id: string
  start: number
  end: number
  excerpt: string
  question: string
  answerType: AnswerType
  choices: string[]
}

export type FreeQuestion = {
  id: string
  question: string
  answerType: AnswerType
  choices: string[]
}

export type Layout = {
  paperWidthPx: number
  paperHeightPx: number
  marginPx: { top: number; right: number; bottom: number; left: number }
  fontSizePx: number
  lineHeight: number
  showLineNumbers: boolean
  exportScale: 1 | 2
}

export type DocumentState = {
  text: string
  marks: Mark[]
  freeQuestions: FreeQuestion[]
  questionOrder: string[]
  layout: Layout
  source: string
}

export type Segment = {
  x1: number
  x2: number
  y: number
}

export type MergedRect = {
  top: number
  bottom: number
  left: number
  right: number
}

export type RenderedLineInfo = {
  start: number
  end: number
  hasNewline: boolean
}
