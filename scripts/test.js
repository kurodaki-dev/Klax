#!/usr/bin/env node
// Dependency-free tests for the .math language core.
const assert = require('assert');
const K = require('../core/klax.js');
const fs = require('fs'), path = require('path');
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  -', name); };
const ev = (src) => K.render(src);
const ok = (r) => assert.deepStrictEqual(r.errors, [], JSON.stringify(r.errors));

t('SIZE accepts the documented spellings', () => {
  for (const s of ['SIZE: {1200px, 1300px};', 'SIZE://(1200px, 1300px);', 'SIZE: 1200px, 1300px;', 'size(1200,1300);', 'SIZE: [1200px,1300px]']) {
    const r = ev(s + '\nf(x)=x;'); ok(r); assert.strictEqual(r.width, 1200, s); assert.strictEqual(r.height, 1300, s);
  }
});
t('SIZE is validated', () => {
  assert.ok(ev('SIZE: 99999px, 10px;').errors.length);
  assert.ok(ev('SIZE: 4px, 4px;').errors.length);
});
t('colours: hex, rgba, hsl, names', () => {
  assert.deepStrictEqual(K.parseColor('#f00'), { color: '#ff0000', opacity: 1 });
  assert.deepStrictEqual(K.parseColor('#ff000080').color, '#ff0000');
  assert.ok(Math.abs(K.parseColor('#ff000080').opacity - 0.502) < 0.01);
  assert.deepStrictEqual(K.parseColor('rgba(0, 128, 255, 0.5)'), { color: '#0080ff', opacity: 0.5 });
  assert.strictEqual(K.parseColor('hsl(120, 100%, 50%)').color, '#00ff00');
  assert.strictEqual(K.parseColor('tomato').color, 'tomato');
  assert.strictEqual(K.parseColor('#12'), null);
});
t('setColor applies to the previous function (hex and rgba)', () => {
  const r = ev('f(x)=x; setColor -> #123456;\ng(x)=-x; setColor -> rgba(10,20,30,0.4);');
  ok(r); assert.ok(r.svg.includes('stroke="#123456"')); assert.ok(r.svg.includes('stroke="#0a141e"') && r.svg.includes('stroke-opacity="0.4"'));
});
t('expression engine', () => {
  const v = (e) => { const p = K.parse('a = ' + e + ';'); assert.deepStrictEqual(p.errors, [], e); return p.runtime.consts.a; };
  assert.strictEqual(v('2+3*4'), 14); assert.strictEqual(v('-2^2'), -4); assert.strictEqual(v('2^3^2'), 512);
  assert.strictEqual(v('2(3+1)'), 8); assert.strictEqual(v('3pi/pi'), 3); assert.strictEqual(v('10 % 4'), 2);
  assert.strictEqual(v('sqrt(16)+abs(-3)'), 7); assert.strictEqual(v('max(1,5,3)'), 5); assert.strictEqual(v('3²'), 9);
  assert.strictEqual(v('fact(5)'), 120); assert.strictEqual(v('log(100)'), 2); assert.strictEqual(v('log(8,2)'), 3);
});
t('user functions & constants reference each other', () => {
  const r = ev('k = 2;\nf(x) = g(x) + k;\ng(x) = x*x;\nh(a,b) = a*b;\np(x) = h(x, 3);'); ok(r);
});
t('errors carry line numbers and do not stop rendering', () => {
  const r = ev('f(x)=x;\ng(x)=unknown(x);\nBG: notacolour!;\nh(x)=x+;');
  assert.deepStrictEqual(r.errors.map(e => e.line), [2, 3, 4]); assert.ok(r.svg.startsWith('<svg'));
});
t('discontinuities are not joined (1/x, tan)', () => {
  const r = ev('RANGE: x(-5,5) y(-5,5);\nf(x)=1/x;');
  assert.ok((r.svg.match(/M/g) || []).length >= 2);
});
t('setCut keeps only the requested pieces', () => {
  const r = ev('RANGE: x(-10,10) y(-5,5);\nf(x)=x; setCut -> [-5,-3] [3,5]; setEnds -> closed;'); ok(r);
  assert.strictEqual((r.svg.match(/<circle/g) || []).length, 4);
  const full = ev('RANGE: x(-10,10) y(-5,5);\nf(x)=x;'); assert.ok(r.svg.length !== full.svg.length);
  assert.ok(ev('f(x)=x; setCut -> 3, -3;').errors.length, 'min < max enforced');
  ok(ev('f(x)=x; setCut -> 1, inf;'));
});
t('setClipY removes the stroke outside a y band', () => {
  const r = ev('RANGE: x(-10,10) y(-5,5);\nf(x)=x; setClipY -> -1, 1;'); ok(r);
  const xs = [...r.svg.matchAll(/M([\d.]+) /g)].map(m => +m[1]);
  assert.ok(xs.length && xs.every(x => x > 400 && x < 800), 'only the middle part is drawn');
});
t('render options: transparent background, no grid / axes / numbers', () => {
  const src = fs.readFileSync(path.join(__dirname, '../examples/demo.math'), 'utf8');
  const a = K.render(src, { background: 'transparent', grid: false, axes: false, ticks: false, legend: false, title: false });
  assert.ok(!/<rect width/.test(a.svg) && !/<line/.test(a.svg) && !/<text/.test(a.svg));
  const b = K.render(src, { background: 'rgba(255,0,0,0.5)' }); assert.ok(b.svg.includes('fill-opacity="0.5"'));
  const c = K.render(src, { background: '#ffeecc' }); assert.ok(c.svg.includes('#ffeecc'));
  assert.ok(K.render(src).svg.includes('<line'), 'options never leak into later renders');
});
t('polar and parametric curves', () => {
  ok(ev('r(t)=cos(2t); setPolar -> on;\nc(t)=(cos(t),sin(t));'));
});
t('every bundled example renders without errors', () => {
  for (const f of fs.readdirSync(path.join(__dirname, '../examples'))) ok(K.render(fs.readFileSync(path.join(__dirname, '../examples', f), 'utf8')));
});
t('every ```math recipe in doc/ renders without errors', () => {
  const dir = path.join(__dirname, '../doc'); let count = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/```math\n([\s\S]*?)```/g)) { ok(K.render(m[1])); count++; }
  }
  assert.ok(count >= 10, 'recipes found');
});
t('PDF wrapper is well formed', () => {
  const pdf = K.makePdf(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), 100, 50);
  const s = Buffer.from(pdf).toString('latin1'); assert.ok(s.startsWith('%PDF-1.4') && s.trim().endsWith('%%EOF'));
  assert.ok(Number(/startxref\n(\d+)/.exec(s)[1]) === s.indexOf('xref\n0 6'));
});
console.log(`\n${n} tests passed`);
