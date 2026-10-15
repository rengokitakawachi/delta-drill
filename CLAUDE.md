# CLAUDE.md — delta-drill

社労士学習クイズ。**正式な学習アプリ（delta drill）は `shaichi-ch1-2.html`**（直接編集可・2026-10-11 User 決定）で、トップ URL `/` はここへ転送する。
**①〜⑩の冊を1つのアプリで切り替える**（2026-10-15 木下氏決定）。冊ごとの違い（版・記録の保存先・Firebase の置き場所）は本体の `BOOKS` 表、問題は冊ごとの **`data/q<冊番号>.json`**（`{chs: 章の一覧, q: 問題}`・1問1行）。
- 名札（id）：①〜⑨は `01-o001` の形。⑩は旧来の `o060` のまま（2027年版に切り替えるときに付け直し、Firebase も `shaichi_ch12` → `drill_10` に移す）。
- 記録：手元は冊ごとのキー（⑩ `dd_shaichi_ch12_v1`、①〜 `dd_drill_<冊>_v1`）、Firebase は同じ doc の冊ごとのフィールド（⑩ `shaichi_ch12`、①〜 `drill_<冊>`）。今日の数・目標40問は全冊の合計で見せる。
- 冊を足すとき：`data/q<冊>.json` を置き、`BOOKS` の該当行に `ready:true` を付ける。
総合版の **index.html はビルド生成物**（正本は `build/`）で、**利用終了**（残しているが更新しない）。
配信URL: https://rengokitakawachi.github.io/delta-drill/ ／ 学習実績は Firebase 経由で ai-work-os の delta と連携（本リポは Firebase 設定を変えない）。

## トークン節約規約（全AIエージェント共通・モデル非依存）

1. **セッション開始時に `docs/REPO_MAP.md` を最初に読む**（探索の前に地図）。地図が実態とズレていそうなら `npm run map` で再生成。**地図の更新は手動**（ファイル追加/削除/大幅なサイズ変化後に再生成してコミット）。
2. **`index.html`（約1.9MB）は全文Read禁止・手編集禁止**。生成物なので読む必要自体がない。編集は `build/` 側 → `npm run build` で再生成。データが超長行に凝縮されているため **Grep も head_limit 必須**（1行で数十万文字を引き込む）。
3. **100KB超は全文Read禁止、50KB超は非推奨**（対象一覧は地図）。必要箇所は Grep -n で行番号を特定 → Read の offset/limit で部分読み。
4. **検証は `npm run check`（= `npm test`）を使う**。出力は PASS/FAIL + サマリのみ（非破壊・exit code 継承）。手作りのバイト比較や `node build/build.cjs` の生ログ確認をしない。
5. **長いコマンド出力は tail / head / grep で切ってから読む**。ビルドの全レポートが必要な場面はほぼ無い。
6. **バイナリ・空ファイル（.nojekyll 等）を Read しない**。
7. **`build/data/` の未参照ファイル（地図の 🗑 節）を探索しない**。ビルドに読まれていない。
8. **スクリプトのファイル名に `test-*` / `*.test.*` を使わない**（node --test が自動検出して誤実行する）。

## 開発の約束

- アプリ（`shaichi-ch1-2.html`）か `data/q*.json` を直したら `npm run version:fix` → `npm test`（版スタンプは本体と問題のファイルを合わせて計算する）。
- 配信HTML（index.html）を直接編集しない。`build/data/*.json`・`build/app2_*.html`・`build/qbank.js` を編集 → `npm run build`。
- `detail_<id>.json` は `gen_<id>.json` と**同順・同長**（不一致だと解説が捨てられる）。
- `weights_<id>.json` のキーは gen の `law` 値と**完全一致**させる（qw() の部分一致依存で誤マッチした実績あり）。
- main へ直接 push しない。feature ブランチ + PR。
- 教材の全文md（book_*.md 等）は著作権のため本リポに置かない。手元に無い教材本文は「ない」と即答せず、ユーザーに提供を依頼する。

## 主要コマンド

| コマンド | 内容 |
|---|---|
| `npm run build` | index.html を再生成 |
| `npm run check` / `npm test` | ビルド再現性チェック（quiet） |
| `npm run map` | docs/REPO_MAP.md を再生成（手動運用） |
