/** Standalone file:// preview built from the same content, CSS, and PNGs as Next.js. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paintTexture = readFileSync(join(root, 'public/textures/impasto-relief.webp')).toString('base64');
const seaPainting = readFileSync(join(root, 'public/ocean/night-seascape.png')).toString('base64');
const frameSources = Array.from({ length: 5 }, (_, i) => 'data:image/png;base64,' + readFileSync(join(root, 'public/animations/firework-frames', `${i}.png`)).toString('base64'));
const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
  .replaceAll("url('/textures/impasto-relief.webp')", `url('data:image/webp;base64,${paintTexture}')`);
const chapters = JSON.parse(readFileSync(join(root, 'data/chapters.json'), 'utf8'));
const esc = (str) => String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const scenes = chapters.map((chapter, index) => {
  const image = readFileSync(join(root, 'public', chapter.image.slice(1))).toString('base64');
  const label = chapter.id === 'about' ? 'About Me' : chapter.id === 'projects' ? 'Experience' : '';
  return `<section class="chapter-section chapter-section--${esc(chapter.id)} ${index % 2 ? 'chapter-section--alternate' : ''}" id="${esc(chapter.id)}" aria-label="${esc(chapter.fishName)}"><button class="fish-button" type="button" aria-label="Open ${esc(chapter.title)}" data-chapter="${esc(chapter.id)}"><img class="fish-button__image" src="data:image/png;base64,${image}" alt="" draggable="false" loading="${index ? 'lazy' : 'eager'}" /></button>${label ? `<span class="chapter-section__label" aria-hidden="true">${label}</span>` : ''}</section>`;
}).join('\n');
const data = JSON.stringify(chapters).replaceAll('<', '\\u003c');
const inlineScript = `
const chapters = ${data};
const byId = new Map(chapters.map(ch => [ch.id, ch]));
const panel = document.getElementById('details');
const title = document.getElementById('detail-title');
const items = document.getElementById('detail-items');
const closeButton = document.getElementById('close-panel');
let lastFocus = null;
function closePanel() { panel.close(); lastFocus?.focus(); }
function openPanel(chapter) {
  if (!chapter) return;
  lastFocus = document.activeElement;
  title.textContent = chapter.title;
  items.replaceChildren();
  for (const item of chapter.items) {
    const article = document.createElement('article');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    h3.textContent = item.title;
    p.textContent = item.text;
    article.append(h3, p);
    items.append(article);
  }
  panel.showModal();
}
document.getElementById('contact-shortcut').addEventListener('click', () => openPanel(byId.get('contact')));
const cue = document.getElementById('hero-scroll-cue');
function updateCue() {
  const visible = window.scrollY < 35;
  cue.classList.toggle('hero__scroll-cue--hidden', !visible);
  cue.setAttribute('aria-hidden', String(!visible));
  cue.tabIndex = visible ? 0 : -1;
}
window.addEventListener('scroll', updateCue, {passive: true});
updateCue();
closeButton.addEventListener('click', closePanel);
panel.addEventListener('cancel', e => { e.preventDefault(); closePanel(); });
panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
for (const button of document.querySelectorAll('.fish-button')) {
  const image = button.querySelector('img');
  let pixels = null;
  function prepare() {
    if (!image.naturalWidth) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', {willReadFrequently: true});
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);
      pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch { pixels = null; }
  }
  if (image.complete) prepare();
  image.addEventListener('load', prepare);
  button.addEventListener('click', e => {
    if (e.detail !== 0 && pixels) {
      const r = image.getBoundingClientRect();
      const x = Math.floor((e.clientX-r.left)/r.width*pixels.width);
      const y = Math.floor((e.clientY-r.top)/r.height*pixels.height);
      if (!(x>=0 && y>=0 && x<pixels.width && y<pixels.height && pixels.data[(y*pixels.width+x)*4+3]>28)) return;
    }
    openPanel(byId.get(button.dataset.chapter));
  });
}
`;
const fireworksJS = `
(() => {
  const hero = document.querySelector('.hero');
  const sea = document.querySelector('.hero__seascape');
  if (!hero || !sea || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frames = ${JSON.stringify(frameSources)};
  const layer = document.createElement('div');
  layer.className = 'fireworks-layer';
  hero.appendChild(layer);
  function updateWaterline() {
    const width = hero.clientWidth, height = hero.clientHeight;
    const iw = sea.naturalWidth, ih = sea.naturalHeight;
    if (!iw || !ih || !width || !height) return;
    const scale = Math.max(width / iw, height / ih);
    const croppedTop = (ih * scale - height) / 2;
    const waterline = ih * .565 * scale - croppedTop;
    hero.style.setProperty('--sea-horizon', Math.max(0, Math.min(height, waterline)) + 'px');
  }
  sea.addEventListener('load', updateWaterline);
  new ResizeObserver(updateWaterline).observe(hero);
  updateWaterline();
  let seq = 0;
  let bursts = [];
  const random = () => Math.random();
  function make(previous) {
    let x = 16 + random() * 68;
    if (previous && Math.abs(x - previous.x) < 12) x = 16 + ((x - 16 + 19) % 68);
    let hue = Math.floor(random() * 360);
    if (previous && Math.abs(((hue - previous.hue + 540) % 360) - 180) < 38) hue = (hue + 90) % 360;
    const pair = document.createElement('div');
    pair.className = 'firework-pair';
    const sky = document.createElement('div');
    sky.className = 'gif-firework gif-firework--sky';
    const reflection = document.createElement('div');
    reflection.className = 'gif-firework gif-firework--reflection';
    const a = document.createElement('img'); a.alt = '';
    const b = document.createElement('img'); b.alt = '';
    sky.appendChild(a); reflection.appendChild(b); pair.append(sky, reflection); layer.appendChild(pair);
    const size = 260 + random() * 280;
    for (const el of [sky, reflection]) {
      el.style.left = x + '%';
      el.style.width = 'min(' + size + 'px, 88vw)';
      el.style.setProperty('--firework-hue', hue + 'deg');
    }
    sky.style.top = (2 + random() * 12) + '%';
    return { id: seq++, x, hue, frame: 1, nextAt: performance.now() + 220, pair, a, b };
  }
  function show(burst) {
    const url = frames[burst.frame];
    burst.a.src = url;
    burst.b.src = url;
  }
  const count = 1 + Math.floor(random() * 3);
  for (let i = 0; i < count; i++) {
    const burst = make(); show(burst); bursts.push(burst);
  }
  // Keep the offline fireworks on the same one-shot 220ms frames + 400ms pause as Hero.tsx.
  setInterval(() => {
    if (document.hidden) return;
    const now = performance.now();
    let finished = false;
    bursts = bursts.map(burst => {
      if (now < burst.nextAt) return burst;
      if (burst.frame === null) {
        burst.pair.remove();
        const next = make(burst); show(next); return next;
      }
      if (burst.frame < 4) {
        burst.frame++;
        burst.nextAt = now + 220;
        show(burst);
        return burst;
      }
      burst.frame = null;
      burst.nextAt = now + 400;
      burst.pair.style.display = 'none';
      finished = true;
      return burst;
    });
    if (finished && bursts.length < 3 && random() < .12) {
      const next = make(); show(next); bursts.push(next);
    } else if (finished && bursts.length > 1 && random() < .08) {
      const index = bursts.findIndex(b => b.frame === null);
      if (index !== -1) { bursts[index].pair.remove(); bursts.splice(index, 1); }
    }
  }, 25);
})();
`;
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Ruoshui Deng — Ocean Portfolio (Offline)</title><style>${css}</style></head><body><main class="ocean-world" aria-label="Underwater portfolio"><section class="hero" id="surface" aria-label="Oil-painted night sea with fireworks"><img class="hero__seascape" src="data:image/png;base64,${seaPainting}" alt=""/><div class="hero__fade" aria-hidden="true"></div><h1 class="hero__handwritten-name">Ruoshui Deng</h1><a class="hero__scroll-cue" href="#about" id="hero-scroll-cue" aria-label="Scroll to view my work"><span>Scroll to view my work</span><svg viewBox="0 0 32 42" fill="none" aria-hidden="true"><path d="M16 2V35M5 25L16 36L27 25" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg></a><button class="hero__contact-brush" type="button" id="contact-shortcut" aria-label="Contact Ruoshui Deng"><svg viewBox="0 0 190 72" preserveAspectRatio="none" aria-hidden="true"><path d="M12 20 52 12 98 17 145 10 180 23 169 37 185 50 130 54 76 58 20 50 4 40Z" fill="#07070d"/><path d="M15 23Q72 11 168 24M8 35Q98 20 178 36M20 47Q92 57 169 43" stroke="#101019" stroke-width="10" stroke-linecap="round" opacity=".8"/><path d="M24 14 70 10M132 59 160 53M5 48 32 53" stroke="#020208" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg><span>Contact</span></button></section>${scenes}</main><dialog class="detail-dialog" id="details" aria-labelledby="detail-title"><div class="detail-dialog__content"><button class="detail-dialog__close" id="close-panel" type="button" aria-label="Close information">×</button><h2 id="detail-title"></h2><div id="detail-items"></div></div></dialog><script>${inlineScript}</script><script>${fireworksJS}</script></body></html>`;
writeFileSync(join(root, 'offline-preview.html'), page, 'utf8');
console.log('Created offline-preview.html (open directly without a server).');
