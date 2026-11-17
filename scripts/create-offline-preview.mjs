/** Standalone file:// preview built from the same content, CSS, and PNGs as Next.js. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paintTexture = readFileSync(join(root, 'public/textures/impasto-relief.webp')).toString('base64');
const seaPainting = readFileSync(join(root, 'public/ocean/night-frame-0.png')).toString('base64');
const skyFrames = Array.from({ length: 3 }, (_, i) => 'data:image/png;base64,' + readFileSync(join(root, 'public/intro', `sky-${i}.png`)).toString('base64'));
const nightFrames = Array.from({ length: 3 }, (_, i) => 'data:image/png;base64,' + readFileSync(join(root, 'public/ocean', `night-frame-${i}.png`)).toString('base64'));
const boatSource = 'data:image/png;base64,' + readFileSync(join(root, 'public/ocean/boat.png')).toString('base64');
const audioSource = 'data:audio/ogg;base64,' + readFileSync(join(root, 'public/audio/background.ogg')).toString('base64');
const coralSources = { about: 'data:image/png;base64,' + readFileSync(join(root, 'public/coral/reef-about.png')).toString('base64'), projects: 'data:image/png;base64,' + readFileSync(join(root, 'public/coral/reef-projects.png')).toString('base64') };
const frameSources = Array.from({ length: 5 }, (_, i) => 'data:image/png;base64,' + readFileSync(join(root, 'public/animations/firework-frames', `${i}.png`)).toString('base64'));
const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
  .replaceAll("url('/textures/impasto-relief.webp')", `url('data:image/webp;base64,${paintTexture}')`);
const chapters = JSON.parse(readFileSync(join(root, 'data/chapters.json'), 'utf8'));
// The fish GIFs are not shipped: use the exact five PNG frames converted from each.
const swimFolders = { about: 'butterflyfish', projects: 'peppermint-angelfish', experience: 'opah', shark: 'shark' };
const swimFrameMs = { about: 180, projects: 180, experience: 150, shark: 160 };
const fishFrameSources = Object.fromEntries(Object.entries(swimFolders).map(([id, folder]) => [id,
  Array.from({ length: 5 }, (_, index) => 'data:image/png;base64,' +
    readFileSync(join(root, 'public/fish/frames', folder, `${index}.png`)).toString('base64'))
]));

const contact = JSON.parse(readFileSync(join(root, 'data/contact.json'), 'utf8'));
const esc = (str) => String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const scenes = chapters.map((chapter, index) => {
  const image = fishFrameSources[chapter.id][0];
  const label = chapter.id === 'about' ? 'About Me' : chapter.id === 'projects' ? 'Experience' : '';
  const reef = coralSources[chapter.id] ? `<img class="coral-reef coral-reef--${esc(chapter.id)}" src="${coralSources[chapter.id]}" alt="" aria-hidden="true"/>` : '';
  return `<section class="chapter-section chapter-section--${esc(chapter.id)} ${index % 2 ? 'chapter-section--alternate' : ''}" id="${esc(chapter.id)}" aria-label="${esc(chapter.fishName)}">${reef}<button class="fish-button" type="button" aria-label="Open ${esc(chapter.title)}" data-chapter="${esc(chapter.id)}"><img class="fish-button__image" src="${image}" alt="" draggable="false" loading="${index ? 'lazy' : 'eager'}" /></button>${label ? chapter.id === 'about'
  ? `<div class="chapter-section__label" aria-hidden="true"><span>About Me</span><span class="chapter-section__explore"><span>Click to explore</span><svg viewBox="0 0 44 24" fill="none" aria-hidden="true"><path d="M40 12H4M14 3L4 12L14 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div>`
  : `<span class="chapter-section__label" aria-hidden="true">${label}</span>` : ''}</section>`;
}).join('\n');
const data = JSON.stringify([...chapters, contact]).replaceAll('<', '\\u003c');
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
      const scale = Math.min(r.width/pixels.width, r.height/pixels.height);
      const x = Math.floor((e.clientX-r.left-(r.width-pixels.width*scale)/2)/scale);
      const y = Math.floor((e.clientY-r.top-(r.height-pixels.height*scale)/2)/scale);
      if (!(x>=0 && y>=0 && x<pixels.width && y<pixels.height && pixels.data[(y*pixels.width+x)*4+3]>28)) return;
    }
    openPanel(byId.get(button.dataset.chapter));
  });
}
`;
const swimJS = `
(() => {
  const frameSets = ${JSON.stringify(fishFrameSources)};
  const frameDelays = ${JSON.stringify(swimFrameMs)};
  const timers = new Map();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const section = entry.target;
      const button = section.querySelector('.fish-button');
      const img = button?.querySelector('img');
      if (!button || !img) continue;
      const id = button.dataset.chapter;
      const frames = frameSets[id];
      const visible = entry.intersectionRatio >= .18;
      section.classList.toggle('chapter-section--in-view', visible);
      if (timers.has(section)) { clearInterval(timers.get(section)); timers.delete(section); }
      img.src = frames[0];
      if (visible && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let frame = 0;
        timers.set(section, setInterval(() => {
          if (!document.hidden) img.src = frames[++frame % 5];
        }, frameDelays[id]));
      }
    }
  }, { threshold: [0, .18, .5] });
  document.querySelectorAll('.chapter-section').forEach(section => observer.observe(section));
})();
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
  const randomSpawnDelay = () => 450 + random() * 1400;
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
  // Only the first burst starts immediately; subsequent launches are staggered.
  const first = make();
  show(first); bursts.push(first);
  let lastCreated = first;
  let nextSpawnAt = performance.now() + randomSpawnDelay();
  setInterval(() => {
    if (document.hidden) return;
    const now = performance.now();
    bursts = bursts.filter(burst => {
      if (now < burst.nextAt) return true;
      if (burst.frame < 4) {
        burst.frame++;
        burst.nextAt = now + 250;
        show(burst);
        return true;
      }
      burst.pair.remove();
      return false;
    });
    if (bursts.length === 0) {
      const next = make(lastCreated, now);
      show(next); bursts.push(next); lastCreated = next;
      nextSpawnAt = now + randomSpawnDelay();
    } else if (now >= nextSpawnAt) {
      if (bursts.length < 3) {
        const next = make(lastCreated, now);
        show(next); bursts.push(next); lastCreated = next;
      }
      nextSpawnAt = now + randomSpawnDelay();
    }
  }, 25);
})();
`;
const musicJS = `
(() => {
  const audio = document.getElementById('site-music');
  if (!audio) return;
  let attempting = false;
  let fadeFrame = 0;
  function start() {
    if (attempting || !audio.paused) return;
    attempting = true;
    audio.volume = 0;
    audio.play().then(() => {
      attempting = false;
      const begun = performance.now();
      cancelAnimationFrame(fadeFrame);
      const fade = now => {
        if (audio.paused) return;
        const progress = Math.min(1, (now - begun) / 3000);
        audio.volume = .28 * progress;
        if (progress < 1) fadeFrame = requestAnimationFrame(fade);
      };
      fadeFrame = requestAnimationFrame(fade);
    }).catch(() => { attempting = false; });
  }
  window.addEventListener('pointerdown', start);
  window.addEventListener('keydown', start);
  start();
})();
`;
const entryJS = `
(() => {
  const gate = document.getElementById('entry-gate');
  const img = document.getElementById('entry-sky');
  if (!gate || !img) return;
  const frames = ${JSON.stringify(skyFrames)};
  frames.forEach(src => { const prefetch = new Image(); prefetch.src = src; });
  let index = 0, leaving = false;
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  const interval = setInterval(() => {
    if (!document.hidden && !leaving) img.src = frames[++index % frames.length];
  }, 1100);
  gate.addEventListener('click', () => {
    if (leaving) return;
    leaving = true;
    clearInterval(interval);
    gate.classList.add('entry-gate--leaving');
    gate.disabled = true;
    setTimeout(() => {
      gate.remove();
      document.body.style.overflow = '';
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1150);
  });
})();
`;
const nightJS = `
(() => {
  const image = document.getElementById('night-scene');
  if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const frames = ${JSON.stringify(nightFrames)};
  frames.forEach(src => { const prefetch = new Image(); prefetch.src = src; });
  let frame = 0;
  setInterval(() => {
    if (!document.hidden) image.src = frames[++frame % frames.length];
  }, 1250);
})();
`;
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Ruoshui Deng — Ocean Portfolio (Offline)</title><style>${css}</style></head><body><audio id="site-music" src="${audioSource}" loop preload="auto" autoplay></audio><button id="entry-gate" class="entry-gate" type="button" aria-label="Click to explore the ocean portfolio"><img id="entry-sky" src="${skyFrames[0]}" alt="" aria-hidden="true"/><span>click to explore</span></button><main class="ocean-world" aria-label="Underwater portfolio"><section class="hero" id="surface" aria-label="Oil-painted night sea with fireworks"><div class="hero__painted-scene" aria-hidden="true"><img id="night-scene" class="hero__seascape" src="data:image/png;base64,${seaPainting}" alt=""/><div class="hero__boat-rock"><img class="hero__boat" src="${boatSource}" alt=""/></div></div><div class="hero__fade" aria-hidden="true"></div><h1 class="hero__handwritten-name">Ruoshui Deng</h1><a class="hero__scroll-cue" href="#hello" id="hero-scroll-cue" aria-label="Scroll to view my work"><span>Scroll to view my work</span><svg viewBox="0 0 32 42" fill="none" aria-hidden="true"><path d="M16 2V35M5 25L16 36L27 25" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" /></svg></a><button class="hero__contact-brush" type="button" id="contact-shortcut" aria-label="Contact Ruoshui Deng"><svg viewBox="0 0 190 72" preserveAspectRatio="none" aria-hidden="true"><path d="M12 20 52 12 98 17 145 10 180 23 169 37 185 50 130 54 76 58 20 50 4 40Z" fill="#07070d"/><path d="M15 23Q72 11 168 24M8 35Q98 20 178 36M20 47Q92 57 169 43" stroke="#101019" stroke-width="10" stroke-linecap="round" opacity=".8"/><path d="M24 14 70 10M132 59 160 53M5 48 32 53" stroke="#020208" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg><span>Contact</span></button></section><section class="hello-section" id="hello" aria-label="Introduction"><span>Hello</span></section>${scenes}</main><dialog class="detail-dialog" id="details" aria-labelledby="detail-title"><div class="detail-dialog__content"><button class="detail-dialog__close" id="close-panel" type="button" aria-label="Close information">×</button><h2 id="detail-title"></h2><div id="detail-items"></div></div></dialog><script>${inlineScript}</script><script>${swimJS}</script><script>${fireworksJS}</script><script>${musicJS}</script><script>${entryJS}</script><script>${nightJS}</script></body></html>`;
writeFileSync(join(root, 'offline-preview.html'), page, 'utf8');
console.log('Created offline-preview.html (open directly without a server).');
