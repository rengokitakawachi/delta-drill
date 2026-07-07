// リポジトリ地図の自動生成: npm run map → docs/REPO_MAP.md
// - 依存ゼロ（node組み込みのみ）・決定的出力（タイムスタンプ等を含めない）
// - サイズはKB丸め。ファイル増減/サイズ変化があった時に `npm run map` で手動再生成する
// - 注意: このファイル名に test-* / *.test.* を使わないこと（node --test の自動検出を回避）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules']);
const KB = n => Math.round(n / 1024);

// ---- ファイル走査（決定的: パス昇順） ----
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push({ rel: path.relative(ROOT, p).split(path.sep).join('/'), size: fs.statSync(p).size });
  }
  return out;
}
// 出力ファイル自身は集計から除外（自己参照で2回目の実行結果が変わるのを防ぐ＝決定性の担保）
const files = walk(ROOT).filter(f => f.rel !== 'docs/REPO_MAP.md').sort((a, b) => a.rel.localeCompare(b.rel, 'en'));

// ---- build.cjs から科目ID表と参照ファイルを動的抽出 ----
const buildSrc = fs.readFileSync(path.join(ROOT, 'build/build.cjs'), 'utf8');
const META = [...buildSrc.matchAll(/no:'([^']*)',id:'([a-z]+)',\s*label:'([^']*)'/g)]
  .map(m => ({ no: m[1], id: m[2], label: m[3] }));
const ids = new Set(META.map(m => m.id));
const dataFiles = files.filter(f => f.rel.startsWith('build/data/'));
const unusedData = dataFiles.filter(f => {
  const m = path.basename(f.rel).match(/^(gen|detail|sentaku|weights)_(.+)\.json$/);
  return !(m && ids.has(m[2]));
});

// ---- サイズ分類 ----
const huge = files.filter(f => f.size > 100 * 1024).sort((a, b) => b.size - a.size);
const mid = files.filter(f => f.size > 50 * 1024 && f.size <= 100 * 1024).sort((a, b) => b.size - a.size);
const total = files.reduce((s, f) => s + f.size, 0);

// ---- 領域一覧（役割は静的定義・未知の領域は自動で「—」） ----
const AREAS = {
  'index.html':        { role: 'メインクイズ（配信物）', warn: '⛔ 生成物。手編集禁止・全文Read禁止。build/ を編集→ npm run build' },
  'roudou-ippan.html': { role: '労働一般 確認問題（単体配信物）', warn: '△ 大きい。部分読み推奨' },
  'ikukyu.html':       { role: '育休 確認問題（単体配信物）', warn: '' },
  'build':             { role: 'ビルド正本(SSOT): head/tail + data/*.json → index.html', warn: 'ここが編集対象' },
  'build/data':        { role: '問題データ gen_/detail_/sentaku_/weights_<科目id>.json', warn: '△ 50KB超多数。必要な科目のみ部分読み' },
  'analysis':          { role: '過去問分析ノート（Obsidian, 10科目+README）', warn: '' },
  'scripts':           { role: 'AI/開発支援スクリプト（地図生成・ビルド検証）', warn: '' },
  'docs':              { role: '生成ドキュメント（この地図）', warn: '⛔ REPO_MAP.md は生成物。npm run map で再生成' },
  'README.md':         { role: 'リポ説明（配信URL・Pages手順）', warn: '' },
  'CLAUDE.md':         { role: 'AIエージェント向け規約（トークン節約規約を含む）', warn: '' },
  'package.json':      { role: 'npm scripts 定義（依存ゼロ）', warn: '' },
  '.nojekyll':         { role: 'GitHub Pages の Jekyll 処理抑止（空ファイル）', warn: 'Read不要' },
};
const tops = [...new Set(files.map(f => f.rel.includes('/') ? f.rel.split('/')[0] : f.rel))];
const areaRows = [];
for (const t of tops) {
  const a = AREAS[t] || { role: '—（未登録領域。役割を AREAS に追記推奨）', warn: '' };
  const group = files.filter(f => f.rel === t || f.rel.startsWith(t + '/'));
  areaRows.push({ path: t + (group.length > 1 ? '/' : ''), n: group.length, kb: KB(group.reduce((s, f) => s + f.size, 0)), ...a });
  if (t === 'build') {
    const d = files.filter(f => f.rel.startsWith('build/data/'));
    areaRows.push({ path: 'build/data/', n: d.length, kb: KB(d.reduce((s, f) => s + f.size, 0)), ...AREAS['build/data'] });
  }
}
// 出力ファイル自身（走査除外）も領域として明示
if (!tops.includes('docs')) areaRows.push({ path: 'docs/', n: 1, kb: 0, ...AREAS['docs'] });

// ---- Markdown 生成 ----
const L = [];
L.push('# REPO_MAP — delta-drill リポジトリ地図');
L.push('');
L.push('> 自動生成: `npm run map`（scripts/repo-map.mjs）。**手編集禁止**。');
L.push('> ファイルの追加/削除/大幅なサイズ変化の後は手動で再生成してコミットすること（自動更新はされない）。');
L.push('');
L.push(`全体: ${files.length} ファイル / 約 ${Math.round(total / 1024)} KB`);
L.push('');
L.push('## 領域一覧');
L.push('');
L.push('| パス | 数 | KB | 役割 | 注意 |');
L.push('|---|--:|--:|---|---|');
for (const r of areaRows) L.push(`| ${r.path} | ${r.n} | ${r.kb} | ${r.role} | ${r.warn} |`);
L.push('');
L.push('## ⛔ 100KB超 — 全文Read禁止');
L.push('');
L.push('| KB | ファイル | 扱い方 |');
L.push('|--:|---|---|');
for (const f of huge) {
  const gen = f.rel === 'index.html' ? '生成物。読む必要なし（build/ が正本）。' : '';
  L.push(`| ${KB(f.size)} | ${f.rel} | ${gen}どうしても中身が要る時: Grep -n で行番号特定 → Read offset/limit で部分読み |`);
}
L.push('');
L.push('※ index.html はデータが少数の超長行に凝縮されている。limit=1 でも数十万文字を引き込むため、**Grep も head_limit 必須**。');
L.push('');
L.push('## △ 50〜100KB — 全文Read非推奨（部分読み推奨）');
L.push('');
L.push(mid.map(f => `- ${KB(f.size)}KB ${f.rel}`).join('\n'));
L.push('');
L.push('## 🗑 build/data の未参照ファイル（ビルドに読まれない。探索・Read不要）');
L.push('');
L.push('build.cjs の META id と突合して検出:');
L.push('');
L.push(unusedData.length ? unusedData.map(f => `- ${f.rel} (${KB(f.size)}KB)`).join('\n') : '- なし');
L.push('');
L.push('## 科目ID表（build.cjs META より自動抽出）');
L.push('');
L.push('| No | id | 科目 |');
L.push('|---|---|---|');
for (const m of META) L.push(`| ${m.no} | ${m.id} | ${m.label} |`);
L.push('');
L.push('## データ形式（再探索を省くためのメモ）');
L.push('');
L.push('- `gen_<id>.json`: 〇✕問題 `[{law,cat,q,a,exp,page}]`（law=章名）。roui のみ例外で `build/qbank.js`(A1..A5,MINE) が正本');
L.push('- `detail_<id>.json`: 詳しい解説の配列。**gen と同順・同長必須**（長さ不一致だとビルドが解説を捨てる）');
L.push('- `sentaku_<id>.json`: 選択式。choices は `正解|誤答1|誤答2|誤答3`');
L.push('- `weights_<id>.json`: 章名→重要度1..3。アプリの qw() は**完全一致→部分一致**の順で解決するため、キーは gen の law と完全一致させる（部分一致依存は誤マッチの実績あり）');
L.push('- 3=🔥頻出バッジ+出題3倍 / 未定義は2');
L.push('');
L.push('## 主要コマンド');
L.push('');
L.push('| コマンド | 内容 |');
L.push('|---|---|');
L.push('| `npm run build` | build/ から index.html を再生成（データ編集後は必須） |');
L.push('| `npm run check`（= `npm test`） | ビルド再現性チェック（quiet: PASS/FAILとサマリのみ・非破壊） |');
L.push('| `npm run map` | この地図を再生成 |');
L.push('');
L.push('## 開発フロー');
L.push('');
L.push('1. `build/data/*.json` か `build/app2_*.html` か `build/qbank.js` を編集');
L.push('2. `npm run build` → index.html 再生成（手編集は絶対にしない）');
L.push('3. `npm run check` で確認 → feature ブランチにコミット → PR（main 直 push 禁止）');
L.push('');

fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/REPO_MAP.md'), L.join('\n'));
console.log(`repo-map: docs/REPO_MAP.md 更新 (${files.length} files scanned, ${huge.length} huge, ${unusedData.length} unused-data)`);
