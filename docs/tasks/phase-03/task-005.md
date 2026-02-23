# Task-005: 3カラムレイアウトと紙面プレビュー

## フェーズ
Phase 03 - UI実装

## 概要
仕様書§5.1 に基づく3カラムレイアウトと、§6, §7 に基づく紙面DOM（#paper）を構築する。

## 作業内容

### 1. アプリ全体レイアウト (`src/components/App.tsx`)
- 3カラム構成: 左（入力/体裁）、中（紙面プレビュー）、右（傍線/設問）
- CSSで `display: grid` or `flex` による配置

### 2. 左ペイン (`src/components/InputPane.tsx`)
- textarea（歌詞入力）
- 「反映」ボタン（押下で text を state に反映、marks はリセット + 警告表示）
- 体裁設定:
  - fontSizePx（数値入力）
  - lineHeight（数値入力）
  - margin（top/right/bottom/left）
  - showLineNumbers（チェックボックス）
  - exportScale（1 / 2 ラジオ）

### 3. 中ペイン - 紙面 (`src/components/Paper.tsx`)
- 仕様書§7.1 の DOM構造を忠実に再現
  ```html
  <div id="paper" class="paper">
    <div class="body-area">
      <div class="line-numbers"></div>
      <div class="text-layer"></div>
      <svg class="overlay"></svg>
    </div>
    <div class="question-area"></div>
  </div>
  ```
- CSSは§7.1 の要点に準拠
- A4サイズ固定、外側スクロール

### 4. 右ペイン（空の枠だけ）
- task-007 で実装するため、プレースホルダのみ

### 5. フォント
- Noto Serif JP を `index.html` の `<link>` でロード
- 明朝系フォールバック設定

### 6. テキストレンダリング
- `renderText` 実装: text → textLayer に TextNode + `<br>` で描画
- renderedLines の構築（DOM版）
- §9.2 に準拠

## 依存
- task-001, task-004

## 完了条件
- テキスト入力 → 反映 → 紙面にテキストが表示される
- A4相当の紙面が中央ペインに表示される
- 明朝体フォントが適用されている
- 本文がドラッグ選択可能
