# DELTA drill（社労士学習クイズ）

社労士試験対策の学習クイズ（〇✕一問一答・選択式4択）。PC / iPhone / iPad で利用。
もとは `ai-work-os` リポジトリに同居していたが、Adam / EVE / delta 本体から責務を分離して本リポジトリ `delta-drill` に切り出した。

## 配信（GitHub Pages）

- このリポジトリの root を GitHub Pages で配信する（`.nojekyll` 同梱）。
- 公開URL（例）: `https://rengokitakawachi.github.io/delta-drill/`
- 学習画面の本体は `index.html`。

### Pages 有効化手順
1. GitHub → このリポ → **Settings → Pages**
2. **Source: Deploy from a branch** → Branch: `main` / `/ (root)` → Save
3. 1〜2分後に上記URLで開けることを 3台すべてで確認

## ファイル構成（すべて半角英数名）

| パス | 内容 |
|---|---|
| `index.html` | 学習クイズ本体（配信されるトップ。旧「社労士問題集.html」と同一内容） |
| `roudou-ippan.html` | 労働一般の確認問題（旧「労働一般_確認問題.html」） |
| `ikukyu.html` | 育休の確認問題（旧「育休確認問題.html」） |
| `build/` | クイズを再生成するビルド一式（正本） |
| `.nojekyll` | Pages が Jekyll 処理をスキップするための空ファイル |

> 日本語ファイル名は Windows 解凍時に文字化けするため廃止し、すべて半角英数名にした。

## ビルド（問題の追加・修正）

詳細は `build/README.md`。

```bash
node build/build.cjs        # → リポジトリ直下の index.html を直接更新する
```

`node build/build.cjs` の出力は元の配信物とバイト一致（再現性確認済み）。

## delta システムとの連携

学習の日次実績は **Firebase** に記録され、`ai-work-os` 側の
`delta-study-sync` ワークフローが Firebase から取得して delta 用ログに反映する。
本リポジトリの移設は Firebase を変更しないため、delta 連携は維持される。

## 素材（教材本文・過去問）の正本

教材本文・過去問・改正の正本は **Obsidian**（`ai-work-os` の方針 docs/04_data_model に準拠）。
著作権物の全文は本リポジトリには含めない。
