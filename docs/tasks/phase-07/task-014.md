# task-014: レスポンシブ（モバイルタブ切替）

## 状態: 完了

## 概要
768px以下でタブ切替式（「入力」「プレビュー」「設問」）に変更。PC表示は既存のまま。

## 変更ファイル
- `src/components/App.tsx`: `activeTab` state追加、`data-active-tab`属性、タブバーUI
- `src/styles/index.css`: `.mobile-tabs`、`@media (max-width: 768px)` でグリッド1カラム化、タブによるペイン表示切替

## 実装内容
- `MobileTab` type (`'input' | 'preview' | 'questions'`)
- `.mobile-tabs` はデスクトップでは `display: none`
- 768px以下で `display: flex` に切替
- `data-active-tab` 属性でCSSセレクタによりアクティブペインのみ表示
