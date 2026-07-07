# REPO_MAP — delta-drill リポジトリ地図

> 自動生成: `npm run map`（scripts/repo-map.mjs）。**手編集禁止**。
> ファイルの追加/削除/大幅なサイズ変化の後は手動で再生成してコミットすること（自動更新はされない）。

全体: 85 ファイル / 約 4378 KB

## 領域一覧

| パス | 数 | KB | 役割 | 注意 |
|---|--:|--:|---|---|
| .nojekyll | 1 | 0 | GitHub Pages の Jekyll 処理抑止（空ファイル） | Read不要 |
| analysis/ | 11 | 67 | 過去問分析ノート（Obsidian, 10科目+README） |  |
| build/ | 65 | 2309 | ビルド正本(SSOT): head/tail + data/*.json → index.html | ここが編集対象 |
| build/data/ | 60 | 2158 | 問題データ gen_/detail_/sentaku_/weights_<科目id>.json | △ 50KB超多数。必要な科目のみ部分読み |
| CLAUDE.md | 1 | 3 | AIエージェント向け規約（トークン節約規約を含む） |  |
| ikukyu.html | 1 | 15 | 育休 確認問題（単体配信物） |  |
| index.html | 1 | 1875 | メインクイズ（配信物） | ⛔ 生成物。手編集禁止・全文Read禁止。build/ を編集→ npm run build |
| package.json | 1 | 0 | npm scripts 定義（依存ゼロ） |  |
| README.md | 1 | 2 | リポ説明（配信URL・Pages手順） |  |
| roudou-ippan.html | 1 | 96 | 労働一般 確認問題（単体配信物） | △ 大きい。部分読み推奨 |
| scripts/ | 2 | 10 | AI/開発支援スクリプト（地図生成・ビルド検証） |  |
| docs/ | 1 | 0 | 生成ドキュメント（この地図） | ⛔ REPO_MAP.md は生成物。npm run map で再生成 |

## ⛔ 100KB超 — 全文Read禁止

| KB | ファイル | 扱い方 |
|--:|---|---|
| 1875 | index.html | 生成物。読む必要なし（build/ が正本）。どうしても中身が要る時: Grep -n で行番号特定 → Read offset/limit で部分読み |

※ index.html はデータが少数の超長行に凝縮されている。limit=1 でも数十万文字を引き込むため、**Grep も head_limit 必須**。

## △ 50〜100KB — 全文Read非推奨（部分読み推奨）

- 96KB roudou-ippan.html
- 87KB build/data/detail_roui.json
- 79KB build/data/detail_kounen.json
- 78KB build/data/gen_roui.json
- 77KB build/qbank.js
- 77KB build/data/detail_kenpo.json
- 72KB build/data/gen_kenpo.json
- 68KB build/data/gen_kounen.json
- 66KB build/data/gen_koyou.json
- 65KB build/data/gen_rkijun.json
- 65KB build/data/gen_ranzen.json
- 64KB build/data/detail_rkijun.json
- 64KB build/data/gen_kokunen.json
- 61KB build/data/gen_shaichi.json
- 61KB build/data/gen_rousai.json
- 58KB build/data/gen_choushu.json
- 55KB build/data/detail_koyou.json
- 53KB build/data/detail_ranzen.json
- 52KB build/data/detail_rousai.json
- 51KB build/data/detail_kokunen.json
- 51KB build/app2_tail.html
- 50KB build/data/gen_oudan.json

## 🗑 build/data の未参照ファイル（ビルドに読まれない。探索・Read不要）

build.cjs の META id と突合して検出:

- build/data/detail_b0.json (21KB)
- build/data/detail_b1.json (22KB)
- build/data/detail_b2.json (21KB)
- build/data/detail_b3.json (23KB)
- build/data/detail_block_0.json (21KB)
- build/data/detail_block_1.json (21KB)
- build/data/detail_block_2.json (21KB)
- build/data/detail_block_3.json (24KB)
- build/data/detail_kenpo_1.json (36KB)
- build/data/detail_kenpo_2.json (40KB)
- build/data/gen_kenpo_1.json (35KB)
- build/data/gen_kenpo_2.json (35KB)

## 科目ID表（build.cjs META より自動抽出）

| No | id | 科目 |
|---|---|---|
| ① | rkijun | 労働基準法 |
| ② | ranzen | 労働安全衛生法 |
| ③ | rousai | 労災保険法 |
| ④ | koyou | 雇用保険法 |
| ⑤ | choushu | 労働保険徴収法 |
| ⑥ | kenpo | 健康保険法 |
| ⑦ | kokunen | 国民年金法 |
| ⑧ | kounen | 厚生年金保険法 |
| ⑨ | roui | 労務管理その他一般常識（労一） |
| ⑩ | shaichi | 社会保険一般常識（社一） |
| ⑪ | oudan | 横断整理 |
| ⑫ | keisan | 日付・年号計算 |
| ⑬ | hrou | 労働経済白書 |
| ⑭ | hkou | 厚生労働白書 |
| ⑮ | ikuji | 育児・介護特集 |

## データ形式（再探索を省くためのメモ）

- `gen_<id>.json`: 〇✕問題 `[{law,cat,q,a,exp,page}]`（law=章名）。roui のみ例外で `build/qbank.js`(A1..A5,MINE) が正本
- `detail_<id>.json`: 詳しい解説の配列。**gen と同順・同長必須**（長さ不一致だとビルドが解説を捨てる）
- `sentaku_<id>.json`: 選択式。choices は `正解|誤答1|誤答2|誤答3`
- `weights_<id>.json`: 章名→重要度1..3。アプリの qw() は**完全一致→部分一致**の順で解決するため、キーは gen の law と完全一致させる（部分一致依存は誤マッチの実績あり）
- 3=🔥頻出バッジ+出題3倍 / 未定義は2

## 主要コマンド

| コマンド | 内容 |
|---|---|
| `npm run build` | build/ から index.html を再生成（データ編集後は必須） |
| `npm run check`（= `npm test`） | ビルド再現性チェック（quiet: PASS/FAILとサマリのみ・非破壊） |
| `npm run map` | この地図を再生成 |

## 開発フロー

1. `build/data/*.json` か `build/app2_*.html` か `build/qbank.js` を編集
2. `npm run build` → index.html 再生成（手編集は絶対にしない）
3. `npm run check` で確認 → feature ブランチにコミット → PR（main 直 push 禁止）
