// 社労士問題集 ビルドスクリプト（リポジトリ内・相対パス版）
// 使い方:  node build/build.cjs   → リポジトリ直下に「社労士問題集.html」を生成
//         生成後、必要なら index.html にコピーして配信する。
//
// 入力（このディレクトリ基準）:
//   ./qbank.js                      労一(roui)の〇✕データ（A1..A5,MINE）
//   ./app2_head.html / app2_tail.html  アプリ本体の前半・後半（データを挟み込む）
//   ./data/gen_<id>.json            各科目の〇✕問題
//   ./data/detail_<id>.json         各科目の詳しい解説（同順・同長）
//   ./data/sentaku_<id>.json        各科目の選択式（穴埋め/4択）
//   ./data/weights_<id>.json        章別の出題重要度
// 出力:
//   ../社労士問題集.html
//
// 注: 教材の全文md（book_*.md 等）はビルドには不要。著作権のため公開リポジトリには含めない。
const fs=require('fs'), vm=require('vm'), path=require('path');
const SRC=__dirname;
const DATA=path.join(SRC,'data');
const p=(...a)=>path.join(...a);

// --- 労一(roui) data from qbank.js ---
let qb=fs.readFileSync(p(SRC,'qbank.js'),'utf8') + '\n;var __OUT={A1:A1,A2:A2,A3:A3,A4:A4,A5:A5,MINE:MINE};';
const sb={}; vm.createContext(sb); vm.runInContext(qb,sb);
const {A1,A2,A3,A4,A5,MINE}=sb.__OUT;
const P1=[17,18,19,20,20,21,21,19,27,28,31,36,37,39,41,42,43,45,47,48,50,70,65,66,66,76,76];
const P2=[85,86,86,87,89,91,95,96,98,99,100,102,103,104,108,109,109,112,114,114,114,119,122,124,125,129,133,134];
const P3=[139,139,157,158,159,162,160,164,166,169,169,177,180,181,182,183,185,184,184,190,188,192,193,195,197,196];
const P4=[200,202,203,203,203,205,206,209,209,209,210,210,212,214,214,218,221,223,223,226,226,227,229,230,232,234,234,233,236,237,237,237,239,241,242,247,249,250,251,254,257,258,259,260,262,263,263];
const P5=[271,271,271,271,286,286,286,288,289,289,290,290,276,282,280,292,298,298,298,300,303,304];
const PM=[142,143,142,145,145,145,148,149,149,150,151,154,154,154];
const PAGES=[].concat(P1,P2,P3,P4,P5,PM);
const rouiArr=[].concat(A1,A2,A3,A4,A5,MINE).map((x,i)=>({law:x.law,cat:x.cat,q:x.q,a:x.a,exp:x.exp,page:PAGES[i]}));

const META=[
 {no:'①',id:'rkijun', label:'労働基準法',           full:'①基礎講座_労働基準法'},
 {no:'②',id:'ranzen', label:'労働安全衛生法',       full:'②基礎講座_労働安全衛生法'},
 {no:'③',id:'rousai', label:'労災保険法',           full:'③基礎講座_労働者災害補償保険法'},
 {no:'④',id:'koyou',  label:'雇用保険法',           full:'④基礎講座_雇用保険法'},
 {no:'⑤',id:'choushu',label:'労働保険徴収法',       full:'⑤基礎講座_労働保険徴収法'},
 {no:'⑥',id:'kenpo',  label:'健康保険法',           full:'⑥基礎講座_健康保険法'},
 {no:'⑦',id:'kokunen',label:'国民年金法',           full:'⑦基礎講座_国民年金法'},
 {no:'⑧',id:'kounen', label:'厚生年金保険法',       full:'⑧基礎講座_厚生年金保険法'},
 {no:'⑨',id:'roui',   label:'労務管理その他一般常識（労一）', full:'⑨基礎講座_労務管理その他の労働に関する一般常識'},
 {no:'⑩',id:'shaichi',label:'社会保険一般常識（社一）',      full:'⑩基礎講座_社会保険に関する一般常識'},
 {no:'⑪',id:'oudan',  label:'横断整理',                      full:'直前対策_横断まとめ'},
 {no:'⑫',id:'keisan', label:'日付・年号計算',                  full:'計算ドリル'},
 {no:'⑬',id:'hrou',   label:'労働経済白書',                    full:'令和7年版 労働経済白書'},
 {no:'⑭',id:'hkou',   label:'厚生労働白書',                    full:'令和7年版 厚生労働白書'},
 {no:'⑮',id:'ikuji',  label:'育児・介護特集',                  full:'特集_育児介護休業法（労一2章）'},
];
const BOOKDATA={}; const report=[];
META.forEach(m=>{
  let arr=[];
  if(m.id==='roui'){ arr=rouiArr; }
  else {
    const fp=p(DATA,'gen_'+m.id+'.json');
    if(!fs.existsSync(fp)){ report.push(m.id+': MISSING'); }
    else { try{ arr=JSON.parse(fs.readFileSync(fp,'utf8')); }catch(e){ report.push(m.id+': JSON-ERROR '+e.message); arr=[]; } }
  }
  // 詳しい解説 detail を同順・同長で付与
  const dp=p(DATA,'detail_'+m.id+'.json');
  if(fs.existsSync(dp)){ try{ const det=JSON.parse(fs.readFileSync(dp,'utf8')); if(Array.isArray(det)&&det.length===arr.length){ arr.forEach((x,i)=>{ if(det[i]&&typeof det[i]==='string')x.detail=det[i]; }); report.push(m.id+' 解説 '+det.length); } else { report.push(m.id+' 解説 長さ不一致 '+det.length+'/'+arr.length); } }catch(e){ report.push(m.id+' 解説 JSON-ERROR'); } }
  const before=arr.length;
  arr=arr.filter(x=>x&&x.q&&x.exp&&typeof x.a==='boolean'&&x.law&&x.cat!==undefined);
  arr.forEach(x=>{ if(typeof x.page!=='number') x.page=null; x.cat=x.cat||''; });
  BOOKDATA[m.id]=arr;
  report.push(m.id.padEnd(8)+' '+arr.length+(before!==arr.length?(' (dropped '+(before-arr.length)+')'):''));
});
const BOOKS=META.map(m=>({no:m.no,id:m.id,label:m.label,full:m.full,total:BOOKDATA[m.id].length}));
// 選択式（穴埋め）データ
const SENTAKU={};
META.forEach(m=>{ const fp=p(DATA,'sentaku_'+m.id+'.json'); if(fs.existsSync(fp)){ try{ let a=JSON.parse(fs.readFileSync(fp,'utf8')); a=a.filter(x=>x&&x.law&&(x.text||(x.q&&x.answer))); a.forEach(x=>{ if(typeof x.page!=='number')x.page=null; x.cat=x.cat||''; }); SENTAKU[m.id]=a; report.push(m.id+' 選択 '+a.length); }catch(e){ report.push(m.id+' 選択 JSON-ERROR '+e.message); } } });
// 章別の出題重要度（過去問分析ベース）
const WEIGHTS={};
META.forEach(m=>{ const fp=p(DATA,'weights_'+m.id+'.json'); if(fs.existsSync(fp)){ try{ WEIGHTS[m.id]=JSON.parse(fs.readFileSync(fp,'utf8')); report.push(m.id+' 重み '+Object.keys(WEIGHTS[m.id]).length); }catch(e){ report.push(m.id+' 重み JSON-ERROR '+e.message); } } });
const dataJs='const BOOKS='+JSON.stringify(BOOKS)+';\nconst BOOKDATA='+JSON.stringify(BOOKDATA)+';\nconst SENTAKU='+JSON.stringify(SENTAKU)+';\nconst WEIGHTS='+JSON.stringify(WEIGHTS)+';\n';
const head=fs.readFileSync(p(SRC,'app2_head.html'),'utf8');
const tail=fs.readFileSync(p(SRC,'app2_tail.html'),'utf8');
const out=head+dataJs+tail;
fs.writeFileSync(p(SRC,'..','index.html'), out);
console.log(report.join('\n'));
console.log('TOTAL', Object.values(BOOKDATA).reduce((a,b)=>a+b.length,0), 'bytes', out.length);
