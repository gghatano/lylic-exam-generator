# Task-008: PNG出力機能

## フェーズ
Phase 04 - PNG出力

## 概要
仕様書§11 に基づき、紙面（#paper）をPNG画像としてダウンロードする機能を実装する。

## 作業内容

### 1. Export Adapter (`src/adapters/export.ts`)
- `exportPaper(paperEl: HTMLElement, scale: 1 | 2): Promise<Blob>`
- `html-to-image` の `toBlob` / `toPng` を使用
- `pixelRatio` パラメータで exportScale を反映（DOMのtransform拡大はしない）

### 2. 出力手順（§11.2 必須）
1. `await document.fonts.ready`
2. `renderOverlay()` を実行（最新状態を保証）
3. `html-to-image` で DOM→PNG 変換
4. Blob生成 → `a[download]` でダウンロード

### 3. ファイル名
- `exam_like_YYYYMMDD_HHMMSS.png`（§11.4）

### 4. UIボタン
- 「PNG出力」ボタンを左ペインまたはヘッダに配置
- 出力中はローディング表示
- 失敗時は通知（「ブラウザの制約で失敗しました。別ブラウザでお試しください」）

### 5. exportScale対応
- Layout state の exportScale（1 / 2）を参照
- 2x推奨

## 依存
- task-005（紙面DOM）
- task-006（SVGオーバーレイ）

## 完了条件
- PNG出力ボタンでファイルがダウンロードされる
- 出力画像がプレビューと同等の紙面を含む
- 2x出力で読みやすい解像度が得られる
- フォントが崩れない（fonts.ready待ち）
- エラー時に通知が表示される
