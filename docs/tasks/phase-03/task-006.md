# Task-006: 傍線部の追加機能（選択 → SVGオーバーレイ描画）

## フェーズ
Phase 03 - UI実装

## 概要
本文のドラッグ選択から傍線部を追加し、SVGオーバーレイで下線と番号を描画する。仕様書§9.3〜§9.6 の中核機能。

## 作業内容

### 1. Selection Adapter (`src/adapters/selection.ts`)
- `domPointToDocOffset(node, localOffset, renderedLines): number` — DOMポイントをドキュメントオフセットに変換
- `docOffsetToDomPoint(offset, renderedLines): {node, offset}` — ドキュメントオフセットをDOMポイントに復元
- `getSelectionOffsets(textLayer, renderedLines): {start, end} | null` — 現在の選択範囲をオフセットとして取得

### 2. 選択→追加フロー
- テキスト選択後にポップアップ（またはボタン）で「傍線部に追加」を表示
- クリックで `addMark` を実行
- 無効選択（本文外/空/重複）は通知して拒否（§12.2）

### 3. SVGオーバーレイ描画 (`src/adapters/overlay.ts`)
- `renderOverlay(marks, renderedLines, textLayerEl, paperEl, overlayEl)`
- §9.5: オフセット→Range復元 → `getClientRects()` → 紙面座標変換 → ノイズ除去 → 行単位マージ
- §9.6: marks順に `<line>` で下線描画、最終segmentに丸数字 `<text>` 配置
- 傍線: 黒、2px
- 番号位置: 最後行右端付近（x2+6, y-6）

### 4. 再描画トリガ（§10）
- text反映後
- mark追加/削除/順序変更
- layout変更
- window resize（debounce）
- フォントロード完了

### 5. 通知UI
- 簡易トースト表示コンポーネント（エラー/警告の表示用）

## 依存
- task-003（rects.ts, textLines.ts）
- task-004（State管理）
- task-005（紙面DOM）

## 完了条件
- 本文ドラッグ選択 → 「追加」→ 下線が描画される
- 複数行またがりの選択で各行に下線が引かれる
- 丸数字の番号が表示される
- 重複選択は拒否される
- resize時に再描画される
