# Task-009: E2Eテスト

## フェーズ
Phase 05 - 品質・仕上げ

## 概要
仕様書§13.4 に基づき、Playwrightで基本導線のE2Eテストを実装する。

## 作業内容

### 1. Playwrightセットアップ
- `@playwright/test` をdevDependencyに追加
- `playwright.config.ts` 設定（Vite devサーバとの連携）
- `playwright/` ディレクトリ配置

### 2. 基本導線テスト（最低1本）
仕様書§13.4 に準拠:
1. テキスト入力（複数行）→「反映」
2. 1〜2行跨ぎの選択（Playwright mouse API で座標指定ドラッグ）
3. 「追加」ボタンでmarkが増えること
4. 右ペインに設問入力欄が出ること
5. PNGボタンがクリック可能であること（ダウンロード自体はモック可）

### 3. ブラウザ
- Chromium で実行（最低限）

## 依存
- task-007（全UIが揃っている前提）
- task-008（PNGボタン）

## 完了条件
- `npx playwright test` でE2Eテストがgreen
- 基本導線（入力→選択→追加→設問表示→PNG）が確認できる
