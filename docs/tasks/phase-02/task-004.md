# Task-004: データモデルとState管理

## フェーズ
Phase 02 - コアロジック

## 概要
仕様書§8.1 に基づくアプリ状態（DocumentState）の型定義とReact State管理を実装する。

## 作業内容

### 1. 型定義 (`src/core/types.ts`)
```ts
type Mark = {
  id: string;
  start: number;
  end: number;
  excerpt: string;
  question: string;
};

type Layout = {
  paperWidthPx: number;
  paperHeightPx: number;
  marginPx: { top: number; right: number; bottom: number; left: number };
  fontSizePx: number;
  lineHeight: number;
  showLineNumbers: boolean;
  exportScale: 1 | 2;
};

type DocumentState = {
  text: string;
  marks: Mark[];
  layout: Layout;
};
```

### 2. デフォルト値
- paperWidthPx: 794, paperHeightPx: 1123（A4@96dpi）
- marginPx: { top: 60, right: 60, bottom: 60, left: 60 }
- fontSizePx: 18, lineHeight: 1.7
- showLineNumbers: false, exportScale: 2

### 3. State操作関数
- `addMark(state, start, end): DocumentState` — 重複チェック、state.text から excerpt を生成、id付与（text引数は不要。state.text を唯一のソースとする）
- `removeMark(state, markId): DocumentState`
- `reorderMark(state, markId, direction): DocumentState` — ↑↓移動
- `updateMarkQuestion(state, markId, question): DocumentState`
- `updateLayout(state, partialLayout): DocumentState`
- `setText(state, text): DocumentState` — marks をリセット（MVP仕様）

### 4. React Hook (`src/hooks/useDocumentState.ts`)
- useReducer ベースで DocumentState を管理
- 各アクションをdispatch可能に

## 依存
- task-003（marks.ts の isOverlapping, buildExcerpt を使用）

## 完了条件
- 型定義が仕様書§8.1 に一致
- State操作のユニットテストがgreen（追加/削除/並替/重複拒否）
