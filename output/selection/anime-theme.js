/* Resonance anime theme helper. Presentation only.
   - Marks <html data-vn-char> with the active guide so name plates, face windows and accents follow the cast.
   - Adds one aria-hidden, pointer-events:none layer (lantern motes) and a scene-wipe element.
   - Plays the wipe when the academy moves to a new scene (new h1 / step label).
   It never edits existing nodes' text, classes or attributes. */
(() => {
  if (window.__vnTheme) return;
  window.__vnTheme = true;
  const root = document.documentElement;
  const cast = ['diren', 'ece', 'eric', 'ade'];
  const inVault = /\/vault\//.test(location.pathname);
  const base = new URL(inVault || /\/(mint|my)\//.test(location.pathname) ? '../' : './', location.href);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function activeGuide() {
    const path = location.pathname;
    if (inVault) {
      if (/protection\.html$/.test(path)) return 'ece';
      if (/eric\.html$/.test(path)) return 'eric';
      if (/ade\.html$/.test(path)) return 'ade';
      return 'diren';
    }
    const people = [...document.querySelectorAll('.rs-person')];
    const chosen = people.findIndex(b => b.getAttribute('aria-pressed') === 'true');
    if (chosen >= 0) return cast[chosen] || 'diren';
    const fromQuery = Number(new URLSearchParams(location.search).get('character'));
    return cast[fromQuery] || 'diren';
  }

  function applyGuide() {
    const who = activeGuide();
    if (root.getAttribute('data-vn-char') === who) return;
    root.setAttribute('data-vn-char', who);
    root.style.setProperty('--vn-face', `url("${new URL((who === 'eric' ? 'denis' : who) + '.jpg', base).href}")`);
  }

  const layer = document.createElement('div');
  layer.className = 'vn-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  const wipe = document.createElement('div');
  wipe.className = 'vn-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  wipe.dataset.i18nIgnore = '';
  const stepLine = document.createElement('b');
  wipe.append(stepLine);
  document.body.append(layer, wipe);

  // Eyecatch: the new scene's step label and title, shown on the curtain (aria-hidden, read from the page, never written to it).
  function playWipe() {
    if (reduce.matches) return;
    const chapter = document.getElementById('chapter');
    const h1 = chapter && chapter.querySelector('h1');
    const step = chapter && chapter.querySelector('.chapter-step, header .small');
    const title = h1 ? h1.textContent.trim() : '';
    const label = step ? step.textContent.split('·')[0].trim() : '';
    wipe.dataset.title = title;
    stepLine.textContent = label.toLowerCase() === title.toLowerCase() ? '' : label;
    wipe.classList.remove('run');
    void wipe.offsetWidth;
    wipe.classList.add('run');
  }
  wipe.addEventListener('animationend', () => wipe.classList.remove('run'));

  let scene = '';
  function sceneKey() {
    const select = document.getElementById('resonance-select');
    if (select && !select.hidden) return 'select';
    const chapter = document.getElementById('chapter');
    if (!chapter) return '';
    const h1 = chapter.querySelector('h1');
    const step = chapter.querySelector('.chapter-step, header .small');
    return (h1 ? h1.textContent : '') + '|' + (step ? step.textContent.split('·')[0] : '');
  }
  // Mutation callbacks run before the next paint, so the curtain covers the new scene's first frame.
  function onChange() {
    applyGuide();
    const next = sceneKey();
    if (scene && next && next !== scene) playWipe();
    scene = next;
  }

  // Keep the theme stylesheet last in <head>, after the styles the academy scripts add, so its rules win ties.
  const sheet = document.getElementById('anime-theme');
  if (sheet) {
    const keepLast = () => { if (document.head.lastElementChild !== sheet) document.head.append(sheet); };
    keepLast();
    new MutationObserver(keepLast).observe(document.head, { childList: true });
  }

  applyGuide();
  scene = sceneKey();
  const observer = new MutationObserver(onChange);
  const select = document.getElementById('resonance-select');
  const chapter = document.getElementById('chapter');
  if (select) observer.observe(select, { attributes: true, subtree: true, attributeFilter: ['aria-pressed', 'hidden'] });
  if (chapter) observer.observe(chapter, { childList: true, attributes: true, attributeFilter: ['class', 'hidden'] });
})();
