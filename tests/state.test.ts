import { describe, it, expect, beforeEach } from 'vitest'
import {
  addMark,
  removeMark,
  updateMarkQuestion,
  updateLayout,
  setText,
  isError,
  resetMarkIdCounter,
  addFreeQuestion,
  removeFreeQuestion,
  updateFreeQuestion,
  updateSource,
} from '../src/core/state'
import type { DocumentState } from '../src/core/types'

describe('state', () => {
  let state: DocumentState

  beforeEach(() => {
    resetMarkIdCounter()
    state = {
      text: 'あいうえお\nかきくけこ\nさしすせそ',
      marks: [],
      freeQuestions: [],
      layout: {
        paperWidthPx: 794,
        paperHeightPx: 1123,
        marginPx: { top: 60, right: 60, bottom: 60, left: 60 },
        fontSizePx: 18,
        lineHeight: 1.7,
        showLineNumbers: false,
        exportScale: 2,
      },
      source: '',
    }
  })

  describe('addMark', () => {
    it('adds a mark with correct excerpt', () => {
      const result = addMark(state, 0, 5)
      expect(isError(result)).toBe(false)
      if (!isError(result)) {
        expect(result.marks).toHaveLength(1)
        expect(result.marks[0].start).toBe(0)
        expect(result.marks[0].end).toBe(5)
        expect(result.marks[0].excerpt).toBe('あいうえお')
        expect(result.marks[0].question).toBe('')
      }
    })

    it('rejects empty selection', () => {
      const result = addMark(state, 3, 3)
      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error).toBe('選択範囲が空です')
      }
    })

    it('rejects overlapping mark', () => {
      const r1 = addMark(state, 0, 5)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addMark(r1, 3, 8)
      expect(isError(r2)).toBe(true)
      if (isError(r2)) {
        expect(r2.error).toMatch(/重なっています/)
      }
    })

    it('rejects when 30 marks already exist', () => {
      // Build a long text with enough non-overlapping ranges
      const chars = Array.from({ length: 100 }, (_, i) => String.fromCodePoint(0x3042 + i)).join('')
      let s: DocumentState = { ...state, text: chars }
      for (let i = 0; i < 30; i++) {
        const r = addMark(s, i * 3, i * 3 + 2)
        if (isError(r)) throw new Error(`unexpected error at mark ${i}`)
        s = r
      }
      expect(s.marks).toHaveLength(30)
      const r31 = addMark(s, 90, 92)
      expect(isError(r31)).toBe(true)
      if (isError(r31)) {
        expect(r31.error).toMatch(/最大30個/)
      }
    })

    it('allows non-overlapping marks', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addMark(r1, 6, 9)
      expect(isError(r2)).toBe(false)
      if (!isError(r2)) {
        expect(r2.marks).toHaveLength(2)
      }
    })
  })

  describe('removeMark', () => {
    it('removes a mark by id', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const id = r1.marks[0].id
      const r2 = removeMark(r1, id)
      expect(r2.marks).toHaveLength(0)
    })

    it('does nothing for unknown id', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = removeMark(r1, 'unknown')
      expect(r2.marks).toHaveLength(1)
    })
  })

  describe('updateMarkQuestion', () => {
    it('updates question text', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const id = r1.marks[0].id
      const r2 = updateMarkQuestion(r1, id, '説明せよ')
      expect(r2.marks[0].question).toBe('説明せよ')
    })
  })

  describe('updateLayout', () => {
    it('updates partial layout', () => {
      const result = updateLayout(state, { fontSizePx: 24 })
      expect(result.layout.fontSizePx).toBe(24)
      expect(result.layout.lineHeight).toBe(state.layout.lineHeight)
    })
  })

  describe('setText', () => {
    it('sets text and clears marks and freeQuestions', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r1b = addFreeQuestion(r1)
      expect(r1b.marks).toHaveLength(1)
      expect(r1b.freeQuestions).toHaveLength(1)

      const r2 = setText(r1b, '新しいテキスト')
      expect(r2.text).toBe('新しいテキスト')
      expect(r2.marks).toHaveLength(0)
      expect(r2.freeQuestions).toHaveLength(0)
    })

    it('normalizes CRLF to LF', () => {
      const result = setText(state, 'a\r\nb\r\nc')
      expect(result.text).toBe('a\nb\nc')
    })
  })

  describe('freeQuestions', () => {
    it('adds a free question', () => {
      const result = addFreeQuestion(state)
      expect(result.freeQuestions).toHaveLength(1)
      expect(result.freeQuestions[0].question).toBe('')
      expect(result.freeQuestions[0].id).toBeTruthy()
    })

    it('removes a free question by id', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = removeFreeQuestion(r1, id)
      expect(r2.freeQuestions).toHaveLength(0)
    })

    it('updates a free question', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestion(r1, id, '本文の主題を述べよ。')
      expect(r2.freeQuestions[0].question).toBe('本文の主題を述べよ。')
    })

    it('does nothing for unknown id on remove', () => {
      const r1 = addFreeQuestion(state)
      const r2 = removeFreeQuestion(r1, 'unknown')
      expect(r2.freeQuestions).toHaveLength(1)
    })
  })

  describe('updateSource', () => {
    it('sets source text', () => {
      const result = updateSource(state, '（清少納言『枕草子』）')
      expect(result.source).toBe('（清少納言『枕草子』）')
    })
  })
})
