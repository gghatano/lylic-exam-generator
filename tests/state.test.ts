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
  reorderQuestion,
  updateMarkAnswerType,
  updateFreeQuestionAnswerType,
  updateMarkChoice,
  updateFreeQuestionChoice,
  addMarkChoice,
  addFreeQuestionChoice,
  removeMarkChoice,
  removeFreeQuestionChoice,
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
      questionOrder: [],
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
    it('adds a mark with correct excerpt and inserts spaces', () => {
      const result = addMark(state, 0, 5)
      expect(isError(result)).toBe(false)
      if (!isError(result)) {
        expect(result.marks).toHaveLength(1)
        // Mark is shifted by 3 due to space insertion
        expect(result.marks[0].start).toBe(3)
        expect(result.marks[0].end).toBe(8)
        expect(result.marks[0].excerpt).toBe('あいうえお')
        expect(result.marks[0].question).toBe('')
        // Text has 3 spaces inserted at position 0
        expect(result.text).toBe('   あいうえお\nかきくけこ\nさしすせそ')
      }
    })

    it('inserts spaces and shifts existing marks when needed', () => {
      // text: "あいうえお\nかきくけこ\nさしすせそ"
      // Add first mark at position 6-9 ("かきく")
      const r1 = addMark(state, 6, 9)
      if (isError(r1)) throw new Error('unexpected')
      // Spaces inserted at 6: "あいうえお\n   かきくけこ\nさしすせそ"
      // mark1: start=9, end=12

      // Add second mark at position 0-3 ("あいう"), before the first mark
      const r2 = addMark(r1, 0, 3)
      if (isError(r2)) throw new Error('unexpected')
      expect(r2.marks).toHaveLength(2)
      // Spaces inserted at 0, first mark (start=9) shifts by 3
      expect(r2.marks[0].start).toBe(12)
      expect(r2.marks[0].end).toBe(15)
      // Second mark: start=3, end=6
      expect(r2.marks[1].start).toBe(3)
      expect(r2.marks[1].end).toBe(6)
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
      // After first mark, text is "   あいうえお\n..." and mark is at [3,8]
      // Try overlapping range (positions in new text)
      const r2 = addMark(r1, 4, 9)
      expect(isError(r2)).toBe(true)
      if (isError(r2)) {
        expect(r2.error).toMatch(/重なっています/)
      }
    })

    it('rejects when 30 marks already exist', () => {
      // Build a long text with enough non-overlapping ranges
      // Each mark adds 2 spaces, so we need plenty of room
      const chars = Array.from({ length: 300 }, (_, i) => String.fromCodePoint(0x3042 + (i % 50))).join('')
      let s: DocumentState = { ...state, text: chars }
      for (let i = 0; i < 30; i++) {
        // Use wide spacing to account for space insertions
        const start = i * 8
        const r = addMark(s, start, start + 2)
        if (isError(r)) throw new Error(`unexpected error at mark ${i}: ${r.error}`)
        s = r
      }
      expect(s.marks).toHaveLength(30)
      const r31 = addMark(s, 250, 252)
      expect(isError(r31)).toBe(true)
      if (isError(r31)) {
        expect(r31.error).toMatch(/最大30個/)
      }
    })

    it('allows non-overlapping marks', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      // After first mark, positions shifted. Use a position well after the first mark.
      const r2 = addMark(r1, 8, 11)
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

  describe('questionOrder', () => {
    it('addMark appends mark id to questionOrder', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      expect(r1.questionOrder).toEqual([r1.marks[0].id])
    })

    it('addFreeQuestion appends fq id to questionOrder', () => {
      const r1 = addFreeQuestion(state)
      expect(r1.questionOrder).toEqual([r1.freeQuestions[0].id])
    })

    it('removeMark removes from questionOrder', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const id = r1.marks[0].id
      const r2 = removeMark(r1, id)
      expect(r2.questionOrder).toEqual([])
    })

    it('removeFreeQuestion removes from questionOrder', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = removeFreeQuestion(r1, id)
      expect(r2.questionOrder).toEqual([])
    })

    it('setText clears questionOrder', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = setText(r1, '新テキスト')
      expect(r2.questionOrder).toEqual([])
    })
  })

  describe('reorderQuestion', () => {
    it('moves a question up', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addFreeQuestion(r1)
      const markId = r2.marks[0].id
      const fqId = r2.freeQuestions[0].id
      expect(r2.questionOrder).toEqual([markId, fqId])

      const r3 = reorderQuestion(r2, fqId, 'up')
      expect(r3.questionOrder).toEqual([fqId, markId])
    })

    it('moves a question down', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addFreeQuestion(r1)
      const markId = r2.marks[0].id
      const fqId = r2.freeQuestions[0].id

      const r3 = reorderQuestion(r2, markId, 'down')
      expect(r3.questionOrder).toEqual([fqId, markId])
    })

    it('does nothing when moving first item up', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addFreeQuestion(r1)
      const markId = r2.marks[0].id

      const r3 = reorderQuestion(r2, markId, 'up')
      expect(r3.questionOrder).toEqual(r2.questionOrder)
    })

    it('does nothing when moving last item down', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = addFreeQuestion(r1)
      const fqId = r2.freeQuestions[0].id

      const r3 = reorderQuestion(r2, fqId, 'down')
      expect(r3.questionOrder).toEqual(r2.questionOrder)
    })
  })

  describe('answerType', () => {
    it('addMark defaults answerType to long and choices to empty', () => {
      const r = addMark(state, 0, 3)
      if (isError(r)) throw new Error('unexpected')
      expect(r.marks[0].answerType).toBe('long')
      expect(r.marks[0].choices).toEqual([])
    })

    it('addFreeQuestion defaults answerType to long and choices to empty', () => {
      const r = addFreeQuestion(state)
      expect(r.freeQuestions[0].answerType).toBe('long')
      expect(r.freeQuestions[0].choices).toEqual([])
    })

    it('updateMarkAnswerType switches to choice and initializes 4 choices', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = updateMarkAnswerType(r1, r1.marks[0].id, 'choice')
      expect(r2.marks[0].answerType).toBe('choice')
      expect(r2.marks[0].choices).toEqual(['', '', '', ''])
    })

    it('updateMarkAnswerType from choice to short clears choices', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = updateMarkAnswerType(r1, r1.marks[0].id, 'choice')
      const r3 = updateMarkAnswerType(r2, r2.marks[0].id, 'short')
      expect(r3.marks[0].answerType).toBe('short')
      expect(r3.marks[0].choices).toEqual([])
    })

    it('updateFreeQuestionAnswerType switches to choice and initializes choices', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestionAnswerType(r1, id, 'choice')
      expect(r2.freeQuestions[0].answerType).toBe('choice')
      expect(r2.freeQuestions[0].choices).toEqual(['', '', '', ''])
    })

    it('updateFreeQuestionAnswerType from choice to word clears choices', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestionAnswerType(r1, id, 'choice')
      const r3 = updateFreeQuestionAnswerType(r2, id, 'word')
      expect(r3.freeQuestions[0].choices).toEqual([])
    })
  })

  describe('choices', () => {
    it('updateMarkChoice updates a specific choice', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = updateMarkAnswerType(r1, r1.marks[0].id, 'choice')
      const r3 = updateMarkChoice(r2, r2.marks[0].id, 1, 'テスト')
      expect(r3.marks[0].choices[1]).toBe('テスト')
      expect(r3.marks[0].choices[0]).toBe('')
    })

    it('updateFreeQuestionChoice updates a specific choice', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestionAnswerType(r1, id, 'choice')
      const r3 = updateFreeQuestionChoice(r2, id, 2, '選択肢C')
      expect(r3.freeQuestions[0].choices[2]).toBe('選択肢C')
    })

    it('addMarkChoice adds a choice up to max 6', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = updateMarkAnswerType(r1, r1.marks[0].id, 'choice')
      expect(r2.marks[0].choices).toHaveLength(4)
      const r3 = addMarkChoice(r2, r2.marks[0].id)
      expect(r3.marks[0].choices).toHaveLength(5)
      const r4 = addMarkChoice(r3, r3.marks[0].id)
      expect(r4.marks[0].choices).toHaveLength(6)
      // At max, should not add more
      const r5 = addMarkChoice(r4, r4.marks[0].id)
      expect(r5.marks[0].choices).toHaveLength(6)
    })

    it('addFreeQuestionChoice adds a choice up to max 6', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestionAnswerType(r1, id, 'choice')
      const r3 = addFreeQuestionChoice(r2, id)
      expect(r3.freeQuestions[0].choices).toHaveLength(5)
      const r4 = addFreeQuestionChoice(r3, id)
      expect(r4.freeQuestions[0].choices).toHaveLength(6)
      const r5 = addFreeQuestionChoice(r4, id)
      expect(r5.freeQuestions[0].choices).toHaveLength(6)
    })

    it('removeMarkChoice removes a choice down to min 2', () => {
      const r1 = addMark(state, 0, 3)
      if (isError(r1)) throw new Error('unexpected')
      const r2 = updateMarkAnswerType(r1, r1.marks[0].id, 'choice')
      // 4 choices, remove index 0
      const r3 = removeMarkChoice(r2, r2.marks[0].id, 0)
      expect(r3.marks[0].choices).toHaveLength(3)
      const r4 = removeMarkChoice(r3, r3.marks[0].id, 0)
      expect(r4.marks[0].choices).toHaveLength(2)
      // At min, should not remove more
      const r5 = removeMarkChoice(r4, r4.marks[0].id, 0)
      expect(r5.marks[0].choices).toHaveLength(2)
    })

    it('removeFreeQuestionChoice removes a choice down to min 2', () => {
      const r1 = addFreeQuestion(state)
      const id = r1.freeQuestions[0].id
      const r2 = updateFreeQuestionAnswerType(r1, id, 'choice')
      const r3 = removeFreeQuestionChoice(r2, id, 0)
      expect(r3.freeQuestions[0].choices).toHaveLength(3)
      const r4 = removeFreeQuestionChoice(r3, id, 0)
      expect(r4.freeQuestions[0].choices).toHaveLength(2)
      const r5 = removeFreeQuestionChoice(r4, id, 0)
      expect(r5.freeQuestions[0].choices).toHaveLength(2)
    })
  })
})
