// ビルド再現性チェック（quiet版）: npm run check / npm test
// - 「node build/build.cjs の出力が現行 index.html とバイト一致するか」を検証する
// - 出力は PASS/FAIL + 最終サマリのみ（トークン節約）。失敗時のみ詳細を数行出す
// - 非破壊: 不一致でも元の index.html を復元してから exit 1
// - 注意: このファイル名に test-* / *.test.* を使わないこと（node --test の自動検出を回避）
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'index.html');

const orig = fs.existsSync(OUT) ? fs.readFileSync(OUT) : null;

const r = spawnSync(process.execPath, ['build/build.cjs'], { cwd: ROOT, encoding: 'utf8' });
const report = (r.stdout || '') + (r.stderr || '');
const tail = report.trim().split('\n').slice(-4).join('\n  ');

if (r.status !== 0) {
  if (orig) fs.writeFileSync(OUT, orig); // 復元
  console.error('FAIL build-check: ビルド自体が失敗 (exit ' + r.status + ')');
  console.error('  ' + tail);
  process.exit(r.status || 1);
}

const built = fs.readFileSync(OUT);
const total = (report.match(/TOTAL (\d+)/) || [])[1] || '?';

if (orig && built.equals(orig)) {
  console.log(`PASS build-check: index.html 再現一致 (bytes=${built.length}, questions=${total})`);
  process.exit(0);
}

if (!orig) {
  console.log(`WARN build-check: 比較元 index.html が無かったため新規生成のみ (bytes=${built.length}, questions=${total})`);
  process.exit(0);
}

// 不一致 → 復元して失敗
fs.writeFileSync(OUT, orig);
console.error(`FAIL build-check: 不一致 (index.html=${orig.length}B / 再ビルド=${built.length}B)`);
console.error('  build/ と index.html が同期していない。意図した変更なら `npm run build` で再生成してコミットすること。');
console.error('  ' + tail);
process.exit(1);
