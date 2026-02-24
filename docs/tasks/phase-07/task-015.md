# task-015: 回答形式・選択問題・解答欄

## 状態: 完了

## 概要
Mark/FreeQuestionに`answerType`と`choices`フィールドを追加し、回答形式4種と選択問題の作成、Paper上の回答欄表示に対応。

## 変更ファイル
- `src/core/types.ts`: `AnswerType`型、Mark/FreeQuestionに`answerType`・`choices`追加
- `src/core/state.ts`: 既存関数にデフォルト値付与、新規8関数追加
- `src/hooks/useDocumentState.ts`: 8つの新Actionタイプ追加
- `src/components/MarkListPane.tsx`: 回答形式ラジオグループ、選択肢エディタ
- `src/components/Paper.tsx`: `AnswerArea`コンポーネント（4種の回答欄表示）
- `src/styles/index.css`: `.answer-type-section`、`.choice-editor`、`.choice-row`
- `src/styles/paper.css`: `.answer-area`、`.answer-line`、`.answer-line-short`、`.choice-list`
- `tests/state.test.ts`: answerType/choices関連テスト18件追加

## 回答形式
| answerType | 表示 |
|---|---|
| `long` | 「(回答)」+ 下線2行（全幅） |
| `short` | 「(回答)」+ 下線1行（全幅） |
| `word` | 「(回答)」+ 短い下線（右詰） |
| `choice` | 選択肢リスト + 「(回答)」+ 短い下線（右詰） |

## 新規State関数
- `updateMarkAnswerType` / `updateFreeQuestionAnswerType`
- `updateMarkChoice` / `updateFreeQuestionChoice`
- `addMarkChoice` / `addFreeQuestionChoice`
- `removeMarkChoice` / `removeFreeQuestionChoice`
