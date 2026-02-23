# Task-003: コアロジック実装（marks / rects / textLines）

## フェーズ
Phase 02 - コアロジック

## 概要
仕様書§8, §9, §13.2 に基づき、DOM非依存の純粋ロジックモジュールを実装する。テスト駆動で進める。

## 作業内容

### 1. `src/core/marks.ts`
- `toCircledNumber(n: number): string` — 1→①, 2→②, ... 30まで対応
- `isOverlapping(a: {start:number, end:number}, b: {start:number, end:number}): boolean`
  - 交差条件: `a.start < b.end && b.start < a.end`
- `buildExcerpt(text: string, start: number, end: number, maxLen?: number): string`
  - 改行→スペース変換、maxLen（デフォルト40）で切り詰め

### 2. `src/core/rects.ts`
- `filterRects(rects: DOMRect[]): DOMRect[]` — width<1 or height<1 を除外
- `mergeRectsByLine(rects: DOMRect[], tolY?: number): MergedRect[]` — top差tolY以内を同一行としてマージ
- `rectsToSegments(mergedRects: MergedRect[], paperRect: DOMRect): Segment[]`
  - Segment = `{x1: number, x2: number, y: number}`（y=bottom、紙面座標）

### 3. `src/core/textLines.ts`
- `buildRenderedLines(text: string): RenderedLineInfo[]`
  - 純粋版（DOMなし）。各行のstart/end/hasNewlineを算出
- `findLineByOffset(lines: RenderedLineInfo[], offset: number): number`
  - 該当行インデックスを返す
- `clampOffsetToLine(lines: RenderedLineInfo[], offset: number): number`
  - 改行位置に落ちた場合、行末に丸める

### 4. ユニットテスト（`tests/`）
仕様書§13.3 に基づく必須テストケースをすべて実装:
- marks: toCircledNumber / isOverlapping / buildExcerpt
- textLines: buildRenderedLines / clampOffsetToLine
- rects: filterRects / mergeRectsByLine / rectsToSegments

#### rectsToSegments の追加テストケース
- paperRect を基準にした座標変換が正しいこと（clientRect → 紙面ローカル座標）
- 複数行にまたがる rect 群で各 segment の y（bottom）が正しく算出されること
- 空の mergedRects を渡した場合に空配列が返ること

## 依存
- task-001

## 完了条件
- 全ユニットテストがgreen
- 仕様書§13.3 の必須ケースを網羅
