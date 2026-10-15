// shaichi-ch1-2.html の版スタンプ。
// VER は「VER 行を伏せた本体」と「冊ごとの問題のファイル data/q*.json（名前順）」を合わせた内容の sha256 先頭8桁。
// 本体か問題を1文字でも変えれば VER が変わるため、更新し忘れが起きない（npm test で強制）。
// 問題を本体の外に出した（2026-10-15）ので、問題だけを直したときも版が変わるように、問題のファイルも入れる。
// アプリは data/q<冊>.json?v=VER で読むので、版が変われば必ず新しい問題が読み込まれる。
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

export const TARGET = 'shaichi-ch1-2.html';
const VER_RE = /const VER='([0-9a-f]{8})';/;

export const DATA_DIR = 'data';
export function dataFiles(dir = DATA_DIR){
  return readdirSync(dir).filter((f) => /^q\d{2}\.json$/.test(f)).sort();
}

export function computeVer(text, dir = DATA_DIR){
  const masked = text.replace(VER_RE, "const VER='%VER%';");
  if (masked === text) throw new Error(`${TARGET}: VER 宣言が見つかりません`);
  const h = createHash('sha256').update(masked, 'utf8');
  for (const f of dataFiles(dir)) h.update(`\n${f}\n`, 'utf8').update(readFileSync(`${dir}/${f}`, 'utf8'), 'utf8');
  return h.digest('hex').slice(0, 8);
}

export function declaredVer(text){
  const m = text.match(VER_RE);
  if (!m) throw new Error(`${TARGET}: VER 宣言が見つかりません`);
  return m[1];
}

export function readTarget(path = TARGET){ return readFileSync(path, 'utf8'); }

// `node scripts/version-stamp.mjs --fix` で VER を正しい値に書き換える
if (process.argv[1]?.endsWith('version-stamp.mjs') && process.argv.includes('--fix')) {
  const {writeFileSync} = await import('node:fs');
  const t = readTarget();
  const want = computeVer(t);
  writeFileSync(TARGET, t.replace(VER_RE, `const VER='${want}';`), 'utf8');
  console.log(`VER = ${want}`);
}
