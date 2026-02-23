import type { DocumentState, FreeQuestion, Layout, Mark } from './types'
import { buildExcerpt, isOverlapping } from './marks'

let nextId = 1

export function generateMarkId(): string {
  return `m${nextId++}`
}

export function resetMarkIdCounter(n = 1): void {
  nextId = n
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

// Sample text with 2 spaces inserted before each underline start position
// Original positions: 7, 66, 78 → after 1st insert: 7→9, 66→68 → after 2nd insert: 68→70, 78→80
const SAMPLE_TEXT = [
  '春はあけぼの。  やうやう白くなりゆく山ぎは、すこしあかりて、紫だちたる雲のほそくたなびきたる。',
  '夏は夜。月のころはさらなり、闇もなほ、  蛍のおほく飛びちがひたる。また、ただ一つ二つなど、ほのかにうち光りて行くもをかし。雨など降るもをかし。',
  '秋は夕暮れ。夕日のさして山の端いと近うなりたるに、烏の寝どころへ行くとて、三つ四つ、二つ三つなど  飛び急ぐさへあはれなり。まいて雁などの連ねたるが、いと小さく見ゆるはいとをかし。日入り果てて、風の音、虫の音など、はた言ふべきにあらず。',
  '冬はつとめて。雪の降りたるは言ふべきにもあらず、霜のいと白きも、またさらでもいと寒きに、火など急ぎおこして、炭もて渡るもいとつきづきし。昼になりて、ぬるくゆるびもていけば、火桶の火も白き灰がちになりてわろし。',
].join('\n')

export function createInitialState(): DocumentState {
  // Pre-populate with sample marks and questions
  // Positions account for the 2-space padding before each underline
  nextId = 1
  const marks: Mark[] = [
    {
      id: generateMarkId(),
      start: 9,
      end: 22,
      excerpt: buildExcerpt(SAMPLE_TEXT, 9, 22),
      question: '下線部①「やうやう白くなりゆく山ぎは」とは、どのような情景を描写しているか、簡潔に説明せよ。',
    },
    {
      id: generateMarkId(),
      start: 70,
      end: 82,
      excerpt: buildExcerpt(SAMPLE_TEXT, 70, 82),
      question: '下線部②「蛍のおほく飛びちがひたる」の情景について、作者はどのような美意識を表しているか述べよ。',
    },
    {
      id: generateMarkId(),
      start: 172,
      end: 183,
      excerpt: buildExcerpt(SAMPLE_TEXT, 172, 183),
      question: '下線部③の「さへ」の意味を説明し、作者の心情を述べよ。',
    },
  ]

  return {
    text: SAMPLE_TEXT,
    marks,
    freeQuestions: [],
    layout: { ...DEFAULT_LAYOUT },
    source: '（清少納言『枕草子』）',
  }
}

const SPACE_INSERT = '  ' // 2 half-width spaces inserted before underline start

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

  // Insert 2 spaces before the underline start to make room for the circled number
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
  }

  return {
    ...state,
    text: newText,
    marks: [...shiftedMarks, mark],
  }
}

export function removeMark(state: DocumentState, markId: string): DocumentState {
  return {
    ...state,
    marks: state.marks.filter((m) => m.id !== markId),
  }
}

export function addFreeQuestion(state: DocumentState): DocumentState {
  const fq: FreeQuestion = {
    id: `fq${nextId++}`,
    question: '',
  }
  return {
    ...state,
    freeQuestions: [...state.freeQuestions, fq],
  }
}

export function removeFreeQuestion(state: DocumentState, id: string): DocumentState {
  return {
    ...state,
    freeQuestions: state.freeQuestions.filter((fq) => fq.id !== id),
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
  }
}

export function isError(result: DocumentState | { error: string }): result is { error: string } {
  return 'error' in result
}
