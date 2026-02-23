# Task-001: プロジェクト初期セットアップ

## フェーズ
Phase 01 - プロジェクト基盤

## 概要
Vite + TypeScript + React プロジェクトの雛形を作成し、開発に必要なツールチェーンを整える。

## 作業内容

### 1. Viteプロジェクト作成
- `npm create vite@latest` で React + TypeScript テンプレートを使用
- Node.js 20 を前提

### 2. 依存パッケージ追加
- **本体**: React, ReactDOM（テンプレートに含まれる）
- **フォント**: Noto Serif JP（Google Fonts、`index.html` で読み込み）
- **PNG出力**: `html-to-image`
- **テスト**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- **Lint/Format**: `eslint`, `prettier`, `eslint-config-prettier`

### 3. 設定ファイル
- `vite.config.ts`: `base: "/<repo-name>/"` を設定（GitHub Pages用）
- `tsconfig.json`: strict mode
- `eslint.config.js`: Flat Config 形式（ESLint v9+）で React + TypeScript ルールを設定
- `.prettierrc`: 基本設定

### 4. ディレクトリ構成
```
src/
  core/        # 純粋ロジック（marks, rects, textLines）
  adapters/    # DOM/Selection/Export などI/O
  components/  # UIコンポーネント
  styles/      # CSS
tests/         # ユニットテスト
```

### 5. スクリプト
- `npm run dev` : 開発サーバ
- `npm run build` : 本番ビルド
- `npm run lint` : ESLint
- `npm run test` : Vitest
- `npm run format` : Prettier

## 完了条件
- `npm run dev` でブラウザに空のReactアプリが表示される
- `npm run lint` / `npm run test` / `npm run build` が全てgreen
- ディレクトリ構成が仕様書§15の推奨構成に沿っている
