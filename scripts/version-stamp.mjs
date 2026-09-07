// shaichi-ch1-2.html の版スタンプ。
// VER は「VER 行を伏せた状態のファイル内容」の sha256 先頭8桁。
// 内容を1文字でも変えれば VER が変わるため、更新し忘れが起きない（npm test で強制）。
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export const TARGET = 'shaichi-ch1-2.html';
const VER_RE = /const VER='([0-9a-f]{8})';/;

export function computeVer(text){
  const masked = text.replace(VER_RE, "const VER='%VER%';");
  if (masked === text) throw new Error(`${TARGET}: VER 宣言が見つかりません`);
  return createHash('sha256').update(masked, 'utf8').digest('hex').slice(0, 8);
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
