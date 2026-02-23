# 古典入試風 画像ジェネレータ（横書き・PNG）仕様書（spec.md）

## 0. 本書の位置づけ
- 本書は、Claude Code（以下CC）が実装を進めるための一次仕様である。
- スコープは **フロントエンドのみ**（静的サイト）。サーバサイドは持たない。
- **品質（単体テスト/CI/運用）**まで含めて要件定義する。

---

## 1. 目的 / ゴール
ユーザが入力した歌詞（任意テキスト）から、国語（古典/現代文）の入試問題風レイアウトで、
- 本文に傍線部（複数行またがり対応）＋番号（①②③…）を付ける
- 傍線部ごとに設問文を付ける
- それっぽい紙面（A4相当）を **PNG** として出力する

---

## 2. スコープ

### 2.1 スコープ内（MVP=初期リリース）
- 横書きレイアウト（A4相当）
- 歌詞入力（textarea）
- プレビュー表示（紙面）
- 本文のドラッグ選択による傍線部追加（複数行またがり必須）
- 傍線部の採番、自動追従（順序変更で再採番）
- 傍線部の削除
- 設問入力（傍線部ごと）
- PNG出力（紙面全体）
- GitHub Actions による GitHub Pages デプロイ
- 単体テスト・CI（最低限）

### 2.2 スコープ外（後続フェーズ）
- 縦書き、ルビ、禁則処理の高度化、二段組
- PDF/SVG出力
- ログイン、保存/共有（URL生成、外部ストレージ）
- 画像内への著作権表記・透かしの高度化
- 大量文書対応（数万文字以上のパフォーマンス最適化）

---

## 3. 非機能要件

### 3.1 対応環境
- ホスティング：GitHub Pages（静的）
- ブラウザ：Chrome / Edge / Safari の現行世代
- デバイス：PC優先（マウス操作）、タブレットで最低限操作可能

### 3.2 性能
- 文字数目安：本文 5,000 文字程度までは実用的に動作（プレビュー/傍線追加/PNG出力）
- 傍線数：最大 30 程度（一般的な問題数を想定）

### 3.3 画像品質
- PNG出力は以下を満たすこと：
  - A4相当の紙面が読める解像度
  - **出力倍率（exportScale）** を 1x / 2x で切替可能（2x推奨）
- フォントは明朝系を優先し、出力時に崩れないこと（フォントロード待ち必須）

### 3.4 操作性
- 追加操作が迷わない：選択 → 追加 → 右ペインに設問が出る、までを一連で
- 破綻防止：無効選択や重複は明示的に拒否し、ユーザに理由を通知

---

## 4. 技術方針（確定）

### 4.1 フロントエンド構成
- Vite + TypeScript + React
- CSS：素のCSS/またはCSS Modules（過度なフレームワークは不要）
- テスト：Vitest + Testing Library（DOMテスト）、Playwright（E2Eは任意だが推奨）
- Lint/Format：ESLint + Prettier

### 4.2 傍線の表現方式（複数行対応の中核）
**DOMをラップしない。**  
選択範囲から `Range.getClientRects()` を取得し、rect群を行単位に正規化して **SVG overlay** に下線を描画する。

- 永続化：本文プレーンテキストに対する `start/end` オフセット（UTF-16 offset）
- 描画：`start/end` → Range復元 → rect再計算 → overlay再描画（常に再計算）

### 4.3 PNG出力方式
- 紙面DOM（本文 + 設問 + SVG overlay）を単一ルート要素 `#paper` 配下に構成
- DOM→PNG変換ライブラリを使用（例：html-to-image 等）
- `document.fonts.ready` を待ってから出力する（必須）

---

## 5. 画面仕様

### 5.1 画面全体（1ページ完結）
3カラム構成（幅が足りない場合は右ペインを折り畳み可能）

- 左：入力/体裁
- 中：紙面プレビュー
- 右：傍線部一覧 / 設問編集

#### 左ペイン（入力/体裁）
- テキスト入力 textarea（歌詞）
- 反映ボタン（MVPでは明示反映でよい。将来は自動反映）
- 体裁設定
  - fontSizePx（数値）
  - lineHeight（数値）
  - margin（top/right/bottom/left）
  - showLineNumbers（ON/OFF）
  - exportScale（1 / 2）

#### 中ペイン（紙面プレビュー）
- A4相当固定サイズ（スクロールは外側）
- 本文（選択可能）
- SVG overlay（下線と番号、pointer-events: none）
- 操作ガイド（薄い注記）
  - 「本文をドラッグ選択 → 追加」

#### 右ペイン（傍線/設問）
- 傍線部リスト（①②③…）
  - 抜粋（excerpt）
  - 設問テキスト入力
  - 順序移動（↑↓）
  - 削除
- 全削除ボタン（確認ダイアログを挟む）

### 5.2 操作フロー
1. ユーザが本文入力
2. 「反映」→ プレビュー更新（既存の傍線は **リセット**：MVPの破綻回避）
3. 本文をドラッグ選択
4. 選択直後に小さなポップアップ（またはボタンエリア）で「傍線部に追加」
5. 追加されると：
   - 下線が引かれる
   - 右ペインに新規設問欄が追加
6. 設問を入力し、必要に応じて順序変更/削除
7. 「PNG出力」で保存

---

## 6. レイアウト仕様（“入試っぽさ”）

### 6.1 用紙
- 用紙サイズ（CSS px）：初期 `794 x 1123`（A4@96dpi相当）
- 背景：白
- 罫線：なし（必要なら後続で追加）

### 6.2 フォント
- 明朝系を優先：Noto Serif JP 推奨
- 代替：`serif` フォールバック
- Webフォントは `index.html` でロードし、`document.fonts.ready` で待つ

### 6.3 本文組版
- 文字サイズ初期：18px（調整可能）
- 行間初期：1.7（調整可能）
- 段落：MVPは改行のまま表示（段落頭下げは後続）
- 行番号：ON時、左に表示（最初は全行でも可。将来は5行ごと）

### 6.4 傍線と番号
- 傍線：黒、2px
- 傍線は各行のrect.bottomを基準に引く
- 番号：最後行の右端付近に配置（`x2 + 6`, `y - 6` など）
- 番号形式：丸数字（①②③…）。30程度までの対応で可

### 6.5 設問欄
- 見出し：`問一` `問二` …（傍線順に対応）
- 本文：ユーザ入力をそのまま表示
- 未入力時のプレースホルダ：
  - `傍線部①について説明せよ。`

---

## 7. DOM/レンダリング設計（必須）

### 7.1 DOM構造（単一ルート）
PNG化のため、紙面は **必ず `#paper` 1ルート**で完結する。

```html
<div id="paper" class="paper">
  <div class="header">（任意）</div>
  <div id="bodyArea" class="body-area">
    <div id="lineNumbers" class="line-numbers"></div>
    <div id="textLayer" class="text-layer"></div>
    <svg id="overlay" class="overlay"></svg>
  </div>
  <div id="questionArea" class="question-area"></div>
</div>
````

#### CSS要点

* `.paper { position: relative; }`
* `.body-area { position: relative; }`
* `.overlay { position:absolute; inset:0; pointer-events:none; }`
* `.text-layer { user-select:text; white-space:normal; }`
* 行番号は `.line-numbers` を別レイヤで配置（選択を邪魔しない）

---

## 8. データモデル（必須）

### 8.1 State（アプリ状態）

```ts
type Mark = {
  id: string;              // "m1" 等、ユニーク
  start: number;           // UTF-16 offset（本文 text の先頭から）
  end: number;             // UTF-16 offset
  excerpt: string;         // UI用の抜粋（max 40 chars 等）
  question: string;        // 設問
};

type Layout = {
  paperWidthPx: number;
  paperHeightPx: number;
  marginPx: { top:number; right:number; bottom:number; left:number; };
  fontSizePx: number;
  lineHeight: number;
  showLineNumbers: boolean;
  exportScale: 1 | 2;
};

type DocumentState = {
  text: string;            // \n 正規化済み
  marks: Mark[];           // 並び順＝採番順
  layout: Layout;
};
```

### 8.2 テキストレンダリング補助（内部キャッシュ）

本文を描画する際に行ごとのDOM参照を保持し、オフセット変換に用いる。

```ts
type RenderedLine = {
  node: Text;              // 当該行のTextNode
  start: number;           // doc offset
  end: number;             // doc offset（改行を含まない）
  hasNewline: boolean;     // 最終行以外 true
};
```

* `renderedLines: RenderedLine[]` は再描画のたびに再生成する

---

## 9. 主要アルゴリズム仕様（中核）

### 9.1 テキスト正規化

* 入力 `\r\n` は `\n` に統一
* 末尾の余計な改行は保持してよい（ただしUI上は行として表示される）

### 9.2 `renderText(text)`（必須）

* `textLayer` をクリア
* `text.split("\n")` で行分割
* 各行を `TextNode` で追加し、行間に `<br>` を追加
* `renderedLines` を構築する

  * `start/end` は **元テキスト上のオフセット**を正確に計算
  * 行末改行は `+1`（最後行を除く）

### 9.3 選択→オフセット（必須）

* `window.getSelection()` から `Range` を取得
* `startContainer/endContainer` が `textLayer` 配下であることを確認
* `domPointToDocOffset(node, localOffset)` で docOffset化

**domPointToDocOffset の要件**

* 対象ノードは基本 TextNode を想定
* 見つからない場合は無効（通知）

### 9.4 オフセット→Range復元（必須）

`docOffsetToDomPoint(offset)` で

* 該当する `RenderedLine` を特定
* 行内localOffsetを算出
* offsetが「改行位置」に落ちた場合は行末に丸める（破綻防止）

### 9.5 rect取得と正規化（必須）

* Range復元後 `range.getClientRects()` を取得
* rectを紙面座標に変換（`paper.getBoundingClientRect()` を基準に引く）
* ノイズ除去（`width < 1` or `height < 1` は捨てる）
* 行単位マージ（abs(top差) < 2px を同一行とみなす）
* マージ結果を `segments: {x1, x2, y}` にする（y=bottom）

### 9.6 SVG overlay描画（必須）

* `overlay` をクリア
* marksの順序で繰り返す（i=0..）

  * `segments` を計算
  * 各segmentに `<line>` を描画
  * 最終segmentに番号 `<text>` を描画（丸数字）
* overlayサイズは paper に追従（viewBox/width/height を paper に合わせる）

### 9.7 Markの重複判定（MVP仕様）

* 既存markと区間が交差する場合は追加を拒否

  * 交差条件：`newStart < oldEnd && oldStart < newEnd`
* ユーザ通知：「既存の傍線部と重なっています」

（後続で「自動分割」や「許可」に拡張可能だが、MVPは拒否）

---

## 10. 再描画トリガ（必須）

以下のイベントで `renderOverlay()` を呼ぶこと。

* text反映後（renderText後）
* mark追加/削除/順序変更
* layout変更（fontSize/lineHeight/margin/行番号）
* window resize（debounce）
* フォントロード完了（初期表示時）

---

## 11. PNG出力仕様（詳細）

### 11.1 出力前提

* 画像化対象は `#paper` ルート
* 生成されるPNGはユーザが保存可能（ダウンロード）

### 11.2 出力手順（必須）

1. `await document.fonts.ready`（フォントロード完了待ち）
2. `renderOverlay()` を実行（最新状態）
3. DOM→PNG変換を実行
4. blobを生成し、`a[download]` で保存

### 11.3 exportScale

* 1x/2xの切替
* 2xはDOMをtransformで拡大しない（レイアウトずれ防止）
* 変換ライブラリ側の `pixelRatio` / `canvasWidth` 等を利用する

### 11.4 ファイル名

* `exam_like_YYYYMMDD_HHMMSS.png`

---

## 12. エラーハンドリング / UXガード

### 12.1 通知方式

* トースト（簡易）または右上のメッセージバーで通知
* 重大操作（全削除）は confirm ダイアログ

### 12.2 想定エラーと挙動

* 本文外選択：無視＋通知
* 空選択：無視＋通知
* 重複：拒否＋通知
* PNG生成失敗：通知（「ブラウザの制約で失敗しました。別ブラウザでお試しください」）
* 本文反映でmarksが消える：反映時に警告表示（MVP仕様）

---

## 13. 品質要件（テスト/CI）

### 13.1 テスト戦略（必須）

* **単体テスト**：純粋ロジック（rect正規化、重複判定、採番、丸数字変換、オフセット変換補助）
* **コンポーネントテスト**：UIイベント（追加/削除/順序変更によるstate更新）
* **E2E（推奨）**：実ブラウザで選択→追加→PNGボタンまでの導線（最低1ケース）

> 注：Selection/Range/getClientRects は JSDOM で再現困難なため、
> その部分は「抽象化」してユニットテスト可能にし、実動作はE2Eで担保する。

### 13.2 テスト対象の分割（実装指針）

以下のモジュール分割を推奨する（テスト容易性を優先）。

* `core/marks.ts`

  * `isOverlapping(a,b)`
  * `reindexMarks(marks)`（表示ラベル生成用）
  * `toCircledNumber(n)`
  * `buildExcerpt(text, start, end)`
* `core/rects.ts`

  * `filterRects(rects)`
  * `mergeRectsByLine(rects, tolY)`
  * `rectsToSegments(mergedRects, paperRect)`
* `core/textLines.ts`

  * `buildRenderedLines(text)`（start/end計算の純粋版）
  * `findLineByOffset(renderedLines, offset)`
  * `clampOffsetToLine(renderedLines, offset)`（改行位置丸め）
* `ui/*`

  * state更新の結合（追加/削除/並べ替え）

Range復元やDOM依存部は `adapters/selection.ts` のように隔離し、

* `SelectionAdapter` インタフェースを切り、
* ロジックテストはモックで行う。

### 13.3 必須ユニットテストケース

#### marks

* `toCircledNumber(1)=①`, `toCircledNumber(10)=⑩` 等（上限30程度）
* `isOverlapping`（交差/非交差/包含/境界一致）
* `buildExcerpt`（改行含む/長さ制限/空白トリム方針）

#### textLines

* `buildRenderedLines` の start/end 計算

  * 例：`"ab\nc"` のオフセットが `a0 b1 \n2 c3` になること
* 改行位置への丸め（offset==line.end+1 のとき line.end に丸める）

#### rects

* width/heightが小さいrectの除外
* top差 tolY 以内でマージされること
* 左右が適切にmin/maxされること
* ソート済み/未ソートrectどちらでも結果が安定すること

### 13.4 E2E（推奨、最低1本）

Playwright想定：

* テキスト入力（複数行）
* 1〜2行跨ぎの選択（ドラッグは Playwright の mouse API で座標指定）
* 「追加」ボタンでmarkが増えること
* 右ペインに設問入力欄が出ること
* PNGボタンがクリック可能であること（ダウンロード自体はモックでも可）

---

## 14. CI/運用（GitHub Actions）

### 14.1 CI（必須）

* push / PR で実行

  * `npm ci`
  * `npm run lint`
  * `npm run test`（Vitest）
  * `npm run build`

### 14.2 Pagesデプロイ（必須）

* main push で build → deploy（GitHub Pages Actions）
* `dist/` を artifact としてアップロードし deploy

#### deploy workflow（例）

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build

      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 14.3 Vite base設定（必須）

* GitHub Pages配下で動くよう、`vite.config.ts` に `base` を設定
* 方式：

  * MVP：手設定 `base: "/<repo-name>/"`

---

## 15. リポジトリ構成（推奨）

* `docs/spec.md`（本書）
* `docs/tasks/task-xxx.md`（CC実装用タスク）
* `src/`

  * `core/`（純粋ロジック）
  * `adapters/`（DOM/Selection/ExportなどI/O）
  * `components/`（UI）
  * `styles/`
* `tests/`（ユニットテスト）
* `playwright/`（E2E、任意）
* `.github/workflows/`

  * `ci.yml`
  * `deploy.yml`

---

## 16. 受け入れ基準（Definition of Done）

### 機能

* 複数行またがりの選択で傍線部が追加され、各行に下線が引かれる
* 傍線部番号が表示される（①②…）
* 傍線部の削除、順序変更で番号が追従する
* 設問文が紙面下部に表示される
* PNG出力ができ、プレビューと同等の紙面が保存できる

### 品質

* 単体テストがgreen（marks/rects/textLinesの主要ケース）
* CIがgreen（lint/test/build）
* Pagesにデプロイされ、URLで動作する

---

## 17. 既知の制約（合意事項）

* 本文を再反映した場合、既存marksは破綻防止のため **リセット**する（MVP）
* JSDOMではSelection/Rangeの挙動が再現困難なため、E2Eで補完する（推奨）
* 丸数字は30程度まで（一般的な問題数）

---

## 18. 次フェーズ（縦書き）への布石

* 傍線は「rect→線分」の抽象で描画しているため、縦書き移行では

  * `writing-mode` 切替
  * rect正規化を列（x基準）へ
  * 下線を縦線へ
    で差し替え可能。
* ただし縦書きのSelection挙動はブラウザ差が出るため、別途検証タスクを立てる。

---

