import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root=process.cwd();
const read=p=>readFileSync(join(root,p),'utf8');
test('every referenced illustration is an existing SVG',()=>{
  const entry=read('view/EntryGate.tsx');
  const hero=read('view/Hero.tsx');
  const fish=read('view/ChapterSection.tsx');
  assert.match(entry,/sky-front-\$\{frame\}\.svg/);
  assert.match(hero,/night-frame-\$\{nightFrame\}\.svg/);
  assert.match(hero,/firework-frames\/\$\{frame\}\.svg/);
  assert.match(fish,/frames\/\$\{animation.folder\}\/\$\{frame\}\.svg/);
  for (const [folder,n] of [['intro',3],['ocean',3]]) for(let i=0;i<n;i++) {
    const file= folder==='intro'?`public/intro/sky-front-${i}.svg`:`public/ocean/night-frame-${i}.svg`;
    assert.ok(existsSync(join(root,file)),file);
  }
  for(const dir of ['lionfish','peppermint-angelfish','shark','opah'])for(let i=0;i<5;i++){
    const file=`public/fish/frames/${dir}/${i}.svg`;
    assert.ok(existsSync(join(root,file)),file);
  }
  for(let i=0;i<5;i++) assert.ok(existsSync(join(root,`public/animations/firework-frames/${i}.svg`)));
});
