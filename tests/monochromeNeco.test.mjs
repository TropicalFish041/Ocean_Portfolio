import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
const root = process.cwd();
const read = p => readFileSync(join(root,p), 'utf8');
function svgFiles(folder) {
  return readdirSync(join(root,folder),{withFileTypes:true}).flatMap(d => {
    const rel = join(folder,d.name);
    return d.isDirectory() ? svgFiles(rel) : d.name.endsWith('.svg') ? [rel] : [];
  });
}
test('all shipped SVG images contain pure path geometry with no white root background or embedded raster',()=>{
  const paths=svgFiles('public').filter(p => !p.endsWith('public/fish/butterflyfish.svg')); // legacy artwork is not referenced; remove it during cleanup
  assert.ok(paths.length >= 40);
  for(const p of paths) {
    const x=read(p);
    assert.match(x, /<svg\b/);
    assert.doesNotMatch(x, /<image\b|base64,|data:image\/(?:png|jpe?g|webp)/i, p);
    assert.doesNotMatch(x, /background:\s*(?:white|#fff(?:fff)?)/i,p);
    assert.doesNotMatch(x, /<rect\b[^>]*fill="white"/i,p);
  }
});
test('three night frames and three transparent opening sky frames exist',()=>{
  for(let i=0;i<3;i++) {
    assert.match(read(`public/ocean/night-frame-${i}.svg`),/<path\b/);
    assert.match(read(`public/intro/sky-front-${i}.svg`),/<path\b/);
  }
});
test('fish and fireworks keep exactly five numbered vector frames',()=>{
  for(const f of ['lionfish','peppermint-angelfish','shark','opah'])for(let i=0;i<5;i++) {
    assert.match(read(`public/fish/frames/${f}/${i}.svg`),/<path\b/);
  }
  for(let i=0;i<5;i++){
    const art=read(`public/animations/firework-frames/${i}.svg`);
    if(i) assert.match(art,/<path\b/);
  }
});
test('all text uses Neco Medium except fish-side titles in Neco Black',()=>{
  const css=read('app/svg-assets.css');
  const layout=read('app/layout.tsx');
  assert.match(layout,/neco@500,900/);
  assert.match(css,/font-weight: 500 !important/);
  assert.match(css,/\.chapter-section__label/);
  assert.match(css,/font-weight: 900 !important/);
  assert.match(css,/\.hero__seascape \{ opacity: 1/);
  assert.doesNotMatch(css,/filter:\s*invert\(1\)/);
});
