# CLAUDE.md — delta-drill

社労士学習クイズ（GitHub Pages 配信）。**index.html はビルド生成物**で、正本は `build/`。
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
