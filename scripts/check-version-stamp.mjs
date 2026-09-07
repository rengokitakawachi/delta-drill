// npm test から呼ばれる。shaichi-ch1-2.html の版スタンプが内容と一致しているか検査する。
import {computeVer, declaredVer, readTarget, TARGET} from './version-stamp.mjs';

const text = readTarget();
const want = computeVer(text);
const got  = declaredVer(text);

if (want === got) {
  console.log(`PASS version-stamp: ${TARGET} 版 ${got}`);
  process.exit(0);
}
console.error(`FAIL version-stamp: ${TARGET} の版スタンプが内容と一致しない`);
console.error(`  宣言 VER='${got}' / 内容から算出 '${want}'`);
console.error('  `node scripts/version-stamp.mjs --fix` を実行してコミットすること。');
process.exit(1);
