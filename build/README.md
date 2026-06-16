# 社労士問題集 ビルド（正本）

このディレクトリは、配信物 `index.html` を生成するための**正本（ソース・オブ・トゥルース）**です。
以前はこれらが一時領域（`/tmp`）にしか無く、コンテナ回収で消失する恐れがあったため、リポジトリに移管しました。

## ビルド方法

```bash
node build/build.cjs        # → リポジトリ直下の index.html を直接更新
```

`node build/build.cjs` の出力は現行の `index.html` とバイト単位で一致します（再現性確認済み）。
※ リポジトリの `package.json` が `"type":"module"` のため、ビルドスクリプトは CommonJS（`.cjs`）です。

## 構成

| パス | 内容 |
|---|---|
| `build.cjs` | ビルドスクリプト（データを集約し head/tail で挟んでHTML化） |
| `app2_head.html` / `app2_tail.html` | アプリ本体（HTML/CSS/JS）の前半・後半。間に生成データを挟む |
| `qbank.js` | 労一(roui)の〇✕データ（`A1..A5`,`MINE`）。roui だけ JS 配列で保持 |
| `data/gen_<id>.json` | 各科目の〇✕問題（roui を除く） |
| `data/detail_<id>.json` | 各科目の詳しい解説（gen と同順・同長） |
| `data/sentaku_<id>.json` | 各科目の選択式（穴埋め／`正解\|誤答1\|誤答2\|誤答3` の4択） |
| `data/weights_<id>.json` | 章別の出題重要度（出題比率） |

科目ID: rkijun(労基) ranzen(安衛) rousai(労災) koyou(雇用) choushu(徴収) kenpo(健保)
kokunen(国年) kounen(厚年) roui(労一) shaichi(社一) oudan(横断) hrou(労働白書)
hkou(厚労白書) ikuji(育児介護特集)

## 編集の流れ（例）

- 〇✕を直す → `data/gen_<id>.json`（と `data/detail_<id>.json` を同インデックスで）を編集 → 再ビルド
- 選択式4択を直す → `data/sentaku_<id>.json` を編集 → 再ビルド
- 労一の〇✕を直す → `qbank.js` を編集 → 再ビルド

## 注意：教材の全文md（book_*.md / roui.md）について

教材（市販テキスト）の**全文mdはビルドには不要**であり、**著作権のため公開リポジトリには含めていません**。
全文mdは非公開の場所（GitHub Pro の private リポジトリ等）に保管すること。
