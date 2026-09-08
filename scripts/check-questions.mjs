// 設問文の壊れを検出する。npm test から呼ばれる。
//
// 背景: 〇×のランダム化（#20）で、正解版 q と誤り版 qx を w/r の置き換えで作っている。
// w と r の文字が重なると、置き換え後に語が二重になる。実際に2件起きた。
//   o176 「支給することができる」→「支給する」で「支給支給する」
//   o160 「翌日」→「その日」で「そのその日」
// 目視では見つからないので機械で止める。
import fs from 'node:fs';

const FILE = 'shaichi-ch1-2.html';
const html = fs.readFileSync(FILE, 'utf8');
const Q = JSON.parse(html.match(/const Q = (\[[\s\S]*?\]);\n/)[1]);

// 法令上、実際に繰り返す表記。これらは誤りではない
const ALLOW = [
  '国民健康保険保険給付費等交付金',
  '医療、介護、介護予防',
];

// exp が「…」で名指しした語は正解版 q に現れるはず、という検査の除外。
// o150 は exp が両当事者の語尾（「できる」「しなければならない」）を対比しているだけで、
// 設問文そのものの語を名指ししていない。
const EXP_QUOTE_SKIP = new Set(['o150']);

const errs = [];

function dup(text) {
  const out = [];
  for (let n = 2; n <= 6; n += 1) {
    const re = new RegExp(`(.{${n}})\\1`, 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      const g = m.group ?? m[1];
      if (/^[、。0-9０-９\s]+$/.test(g)) continue;
      const ctx = text.slice(Math.max(0, m.index - 20), m.index + g.length * 2 + 10);
      if (ALLOW.some((a) => ctx.includes(a) || text.includes(a))) continue;
      out.push({ g, ctx });
    }
  }
  return out;
}

for (const q of Q) {
  for (const f of ['q', 'qx', 'text']) {
    const t = q[f];
    if (!t) continue;
    for (const d of dup(t)) {
      errs.push(`${q.id} の ${f} に語の重複「${d.g}」: …${d.ctx}…`);
    }
  }
  if (q.t === 'ox') {
    if (!q.qx) errs.push(`${q.id} に誤り版 qx が無い`);
    else {
      if (q.q === q.qx) errs.push(`${q.id} の正解版と誤り版が同一`);
      if (!q.w || !q.r) errs.push(`${q.id} に w / r が無い`);
      else {
        // w は spotChunks で誤り箇所を特定するのに使うため、誤り版で一意である必要がある
        if (q.qx.split(q.w).length - 1 !== 1) errs.push(`${q.id} の誤り版に w「${q.w}」が1回でない`);
        if (q.qx.replace(q.w, q.r) !== q.q) errs.push(`${q.id} は w→r の置き換えで正解版に一致しない`);
        // r が正解版に複数回出るのは、入れ替え型を単純置換で作って片方の語が消えた徴候。
        // 実際に o006（「次いで年金」）と o099（「都道府県を交付する」）がこれで壊れていた。
        if (q.q.split(q.r).length - 1 !== 1) errs.push(`${q.id} の正解版に r「${q.r}」が1回でない（入れ替え型の取りこぼしの疑い）`);
        // exp が「…」で正しい語を名指ししているのに、その語が正解版に無い＝ r が別物にすり替わっている。
        // o105 は w「所得の額」に対し r が「6年」になっていて、正解版が
        // 「所得の少ない者の6年に応じて」という日本語にならない文になっていた。
        // 置換の整合（w→r で q に一致）は取れてしまうため、上の検査では止まらない。
        if (!EXP_QUOTE_SKIP.has(q.id)) {
          for (const m of (q.exp || '').matchAll(/「([^」]{1,20})」/g)) {
            const term = m[1];
            if (!q.q.includes(term) && !q.w.includes(term)) {
              errs.push(`${q.id} の exp が「${term}」を正しい語として挙げているが正解版に無い（r「${q.r}」がすり替わっている疑い）`);
            }
          }
        }
      }
    }
  } else if (q.t === 'sen') {
    const gs = [...q.text.matchAll(/【(.+?)】/g)];
    if (!gs.length) errs.push(`${q.id} に空欄が無い`);
    for (const g of gs) {
      const opts = g[1].split('|');
      if (opts.length < 2) errs.push(`${q.id} の選択肢が1つしかない`);
      if (new Set(opts).size !== opts.length) errs.push(`${q.id} の選択肢に重複がある`);
    }
  }
}

if (errs.length) {
  console.error(`FAIL check-questions: ${errs.length}件`);
  errs.forEach((e) => console.error('  ' + e));
  process.exit(1);
}
console.log(`PASS check-questions: ${Q.length}問（○×${Q.filter((q) => q.t === 'ox').length}・選択式${Q.filter((q) => q.t === 'sen').length}）`);
