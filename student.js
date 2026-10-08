// ─────────────────────────────────────────────
//  WaffleBrain — student.js
//  Student interface controller.
//
//  Student Mode is a small browser for the student to use during a lesson:
//  Collection → Level → Topic → Waffle. The URL is the only state:
//
//    student.html?collection=ielts&level=B1&category=Part+2%3A+Long+Turn
//
//  Choosing a Collection, Level or Topic rewrites the URL (replaceState, so
//  the browser's Back button is not filled with every tap), and reloading
//  restores the same choice. The Teacher page's "Student" link uses the same
//  parameters, and the Teacher tab links back with the same ones. Nothing is
//  kept in localStorage or sessionStorage.
//
//  What the page shows is the STUDENT side of each Waffle in
//  data/waffles.json: the student prompt, Goal and Starters — never the
//  teacher text or Language Focus. (A record without a Goal or Starters has
//  those sections hidden.)
//
//  General English is a special case. Its 30 Student Waffles live in
//  studentSupport.js, are not tagged with a Level or Topic, and are shown as
//  one mixed set; the Level and Topic controls are replaced by a note. (The
//  520 General English records in waffles.json are not used here.)
//
//  A Level + Topic with no Waffles (e.g. Kids › Gaming & Pixel Worlds at
//  B2+) shows a "No Waffles here yet" message. It never falls back to
//  another Level or Topic.
//
//  No paywall here: Student Mode must open for the students of a Pro
//  teacher, so js/payment.js is not loaded on this page. Premium
//  Collections just carry a small "Pro" tag.
//
//  Depends on studentSupport.js (WAFFLES) and collections.js (COLLECTIONS).
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const promptCard      = document.getElementById('prompt-card');
const waffleSection   = document.getElementById('waffle-section');
const goalSection     = document.getElementById('goal-section');
const startersSection = document.getElementById('starters-section');
const emptySection    = document.getElementById('empty-section');

const waffleText   = document.getElementById('waffle-text');
const goalText     = document.getElementById('goal-text');
const startersList = document.getElementById('starters-list');
const emptyTitle   = document.getElementById('empty-title');
const emptyText    = document.getElementById('empty-text');
const emptyAllBtn  = document.getElementById('empty-all-btn');

const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const liveRegion = document.getElementById('waffle-live');

// Collection menu (legacy ids: "waffle-select" = the Collection menu)
const waffleSelect       = document.getElementById('waffle-select');
const waffleTrigger      = document.getElementById('waffle-trigger');
const waffleTriggerIcon  = document.getElementById('waffle-trigger-icon');
const waffleTriggerLabel = document.getElementById('waffle-trigger-label');
const wafflePremiumTag   = document.getElementById('waffle-premium-tag');
const waffleList         = document.getElementById('waffle-list');

// Level and Topic
const levelRow    = document.getElementById('level-row');
const levelSeg    = document.getElementById('level-seg');
const topicRow    = document.getElementById('topic-row');
const topicLabel  = document.getElementById('topic-label');
const chipWrap    = document.getElementById('chip-wrap');
const chipScroll  = document.getElementById('chip-scroll');
const mixedNote   = document.getElementById('mixed-note');

// Found by id, not by href: Netlify serves href="student.html" as "/student".
const selfLink = document.getElementById('student-link');
// The Teacher tab carries the same Collection / Level / Topic back to the
// Teacher page (which reads these parameters when it opens).
const teacherLink = document.getElementById('teacher-link');

// ── Levels ────────────────────────────────────
// The three `level` values in data/waffles.json (same as the Teacher page).
// Students see a plain word with the CEFR code underneath; Cambridge shows
// the exam instead. IELTS keeps the generic wording on purpose: these
// levels are English levels, not IELTS bands.
const LEVELS = ['A1A2', 'B1', 'B2+'];
const DEFAULT_LEVEL = 'A1A2';

const LEVEL_WORDS = {
  A1A2:  { main: 'Easier', sub: 'A1/A2', full: 'Easier, A1/A2' },
  B1:    { main: 'Medium', sub: 'B1',    full: 'Medium, B1' },
  'B2+': { main: 'Harder', sub: 'B2+',   full: 'Harder, B2 and above' },
};

const CAMBRIDGE_WORDS = {
  A1A2:  { main: 'Key',         sub: 'A2',  full: 'A2 Key' },
  B1:    { main: 'Preliminary', sub: 'B1',  full: 'B1 Preliminary' },
  'B2+': { main: 'First',       sub: 'B2+', full: 'B2 First and above' },
};

function levelWords(collectionId, level) {
  return (collectionId === 'cambridge' ? CAMBRIDGE_WORDS : LEVEL_WORDS)[level];
}

// ── Topics ────────────────────────────────────
// Chips are the categories that really have Waffles for the Collection +
// Level, in the order they first appear in waffles.json — except that these
// (shared by General English and Business) keep the Teacher page's order.
const TOPIC_ORDER = ['Everyday Situations', 'Simple Roleplay', 'Describe',
                     'Choose and Create', 'Explain and Show', 'Guided Stories'];

function topicsFor(collectionId, level) {
  if (!allWaffles) return [];
  const inCollection = allWaffles.filter(w => w.collection === collectionId);
  const firstSeen = [...new Set(inCollection.map(w => w.category))];
  const rank = c => {
    const i = TOPIC_ORDER.indexOf(c);
    return i === -1 ? TOPIC_ORDER.length + firstSeen.indexOf(c) : i;
  };
  return [...new Set(inCollection.filter(w => w.level === level).map(w => w.category))]
    .sort((a, b) => rank(a) - rank(b));
}

function topicLabelFor(collection) {
  return (collection && collection.studentCategoryLabel) || 'Topic';
}

// ── State (from the URL) ──────────────────────
let allWaffles = null;      // data/waffles.json, once loaded
let loadFailed = false;

const state = { collection: 'general', level: DEFAULT_LEVEL, category: '' };

function findCollection(id) {
  return COLLECTIONS.find(c => c.id === id);
}

const isGeneral = () => state.collection === 'general';

// Reads ?collection=…&level=…&category=… An unknown Collection is treated as
// General English; a missing or unknown Level becomes the default Level (it is
// shown selected, and written back to the URL). A category is kept as given:
// if it has no Waffles at the Level, the page says so (see refresh()).
function readUrl() {
  const params = new URLSearchParams(location.search);
  const collection = params.get('collection');
  if (collection && findCollection(collection)) state.collection = collection;

  // A hand-typed "B2+" arrives as "B2 " (the browser reads + as a space).
  const level = (params.get('level') || '').replace(' ', '+');
  state.level = LEVELS.includes(level) ? level : DEFAULT_LEVEL;

  state.category = isGeneral() ? '' : (params.get('category') || '');
}

// General English keeps a plain link, like the Teacher page's Student link.
function currentSearch() {
  if (isGeneral()) return '';
  const params = new URLSearchParams({ collection: state.collection, level: state.level });
  if (state.category) params.set('category', state.category);
  return `?${params}`;
}

function syncUrl() {
  const search = currentSearch();
  try { history.replaceState(null, '', location.pathname + search); } catch (e) { /* not allowed here */ }
  // Keep this view when the page's own "Student" tab is clicked.
  if (selfLink) selfLink.href = 'student.html' + search;
  if (teacherLink) teacherLink.href = 'index.html' + search;
}

// ── History ───────────────────────────────────
const waffleHistory = [];   // Waffles already shown, for Back
let   currentWaffle = null; // the Waffle currently on screen

// ── Waffles to draw from ──────────────────────
let pool = [];

// ── Random Waffle picker ──────────────────────
// Avoids an immediate repeat of the Waffle on screen whenever there is more
// than one to choose from.
function pickRandomWaffle() {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  let next;
  do {
    next = pool[Math.floor(Math.random() * pool.length)];
  } while (next === currentWaffle);

  return next;
}

// ── Announcements for screen readers ──────────
// Silent until the page has been set up, so loading does not read a Waffle out.
let ready = false;
function announce(text) {
  if (ready) liveRegion.textContent = text;
}

// ── Render ─────────────────────────────────────
function showCardContent(show) {
  waffleSection.style.display = show ? '' : 'none';
  emptySection.hidden = show;
}

function renderWaffle(w) {
  currentWaffle = w;
  showCardContent(true);

  // 🧇 Waffle — the speaking mission
  waffleText.textContent = w.waffle;

  // 🎯 Goal and 💬 Starters: hidden for any Waffle that has none.
  goalSection.style.display     = w.goal ? '' : 'none';
  startersSection.style.display = w.starters ? '' : 'none';

  goalText.textContent = w.goal || '';

  // 💬 Waffle Starters — always visible, never collapsible
  startersList.innerHTML = '';
  (w.starters || []).forEach(starter => {
    const li = document.createElement('li');
    li.textContent = starter;
    startersList.appendChild(li);
  });

  // Flash
  promptCard.classList.remove('flash');
  void promptCard.offsetWidth;
  promptCard.classList.add('flash');
  setTimeout(() => promptCard.classList.remove('flash'), 350);

  // Back button: enabled only when there is history to return to
  backBtn.disabled = waffleHistory.length === 0;
  announce(`Waffle: ${w.waffle}`);
}

// No Waffles for the chosen Level + Topic (or the data did not load): say so,
// clear the card and switch Next/Back off. Never shows another pool instead.
const NO_WAFFLES_TITLE = '🧇 No Waffles here yet';

function renderEmpty(message, { offerAll = false, title = NO_WAFFLES_TITLE } = {}) {
  currentWaffle = null;
  showCardContent(false);
  goalSection.style.display = 'none';
  startersSection.style.display = 'none';
  emptyTitle.textContent = title;
  emptyText.textContent = message;
  emptyAllBtn.hidden = !offerAll;
  nextBtn.disabled = true;
  backBtn.disabled = true;
  announce(`${title.replace('🧇 ', '')}. ${message}`);
}

// ── Display (draws new Waffle, saves current to history) ──
function showWaffle() {
  const next = pickRandomWaffle();
  if (!next) return;
  if (currentWaffle !== null) waffleHistory.push(currentWaffle);
  nextBtn.disabled = false;
  renderWaffle(next);
}

// ── Go back ───────────────────────────────────
function goBack() {
  if (waffleHistory.length === 0) return;
  renderWaffle(waffleHistory.pop());
}

// ── Build the pool for the current choice and show a Waffle ──
function toStudentWaffle(w) {
  return { id: w.id, waffle: w.student.prompt, goal: w.student.goal, starters: w.student.starters };
}

function refresh() {
  waffleHistory.length = 0;
  currentWaffle = null;

  if (isGeneral()) {
    pool = WAFFLES;
    showWaffle();
    return;
  }

  pool = [];
  if (!allWaffles) {
    if (loadFailed) {
      renderEmpty('Please check your connection and reload the page.', { title: '🧇 Could not load the Waffles' });
    } else {
      // Still loading: a plain placeholder, not the "No Waffles" message.
      showCardContent(true);
      waffleText.textContent = 'Loading Waffles…';
      goalSection.style.display = 'none';
      startersSection.style.display = 'none';
      nextBtn.disabled = true;
      backBtn.disabled = true;
    }
    return;
  }

  const atLevel = allWaffles.filter(w => w.collection === state.collection && w.level === state.level);
  const matching = state.category ? atLevel.filter(w => w.category === state.category) : atLevel;
  pool = matching.map(toStudentWaffle);

  if (pool.length) { showWaffle(); return; }

  const words = levelWords(state.collection, state.level);
  const levelName = words ? words.sub : state.level;
  if (state.category && atLevel.length) {
    renderEmpty(`“${state.category}” has no Waffles at ${levelName} yet. Try another level, or all topics.`,
      { offerAll: true });
  } else {
    renderEmpty(`There are no Waffles for ${levelName} in this Collection yet. Try another level.`);
  }
}

// ── Collection menu ────────────────────────────
// Like the Teacher menu, but simple: no group headings, no counts. Premium
// Collections have a small "Pro" tag and are never locked here.
function renderCollectionList() {
  waffleList.innerHTML = '';

  COLLECTIONS.filter(c => !c.locked).forEach(c => {
    const li = document.createElement('li');
    li.className = 'waffle-option';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(c.id === state.collection));
    li.dataset.collection = c.id;
    // Focusable from the keyboard (arrow keys), but not a Tab stop.
    li.tabIndex = -1;

    const icon = document.createElement('span');
    icon.className = 'waffle-option-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = c.icon || '🧇';

    const label = document.createElement('span');
    label.className = 'waffle-option-label';
    label.textContent = c.name;

    li.append(icon, label);

    const note = [];
    if (c.id === 'general') {
      const tag = document.createElement('span');
      tag.className = 'waffle-option-tag';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = 'Mixed';
      li.appendChild(tag);
      note.push('mixed set');
    }
    if (c.isPremium) {
      const tag = document.createElement('span');
      tag.className = 'waffle-option-premium';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = 'Pro';
      li.appendChild(tag);
      note.push('Pro');
    }
    if (note.length) li.setAttribute('aria-label', `${c.name}, ${note.join(', ')}`);

    li.addEventListener('click', () => selectCollection(c.id));
    waffleList.appendChild(li);
  });
}

function renderTrigger() {
  const c = findCollection(state.collection);
  waffleTriggerIcon.textContent  = c.icon || '🧇';
  waffleTriggerLabel.textContent = c.name;
  wafflePremiumTag.hidden = !c.isPremium;
  // Per-Collection colours (body[data-collection] in style.css); General is the default look.
  if (isGeneral()) delete document.body.dataset.collection;
  else document.body.dataset.collection = c.id;
}

function selectCollection(id) {
  const byKeyboard = lastInput === 'keyboard';
  closeWaffleList();
  if (id !== state.collection) {
    state.collection = id;
    state.category = '';   // Topics differ between Collections
    renderAll();
    syncUrl();
    refresh();
  }
  // The list is redrawn on every choice, so hand keyboard focus back to the
  // menu button (a mouse or tap leaves focus free for Space = Next).
  if (byKeyboard) waffleTrigger.focus();
}

function openWaffleList() {
  waffleList.hidden = false;
  waffleSelect.classList.add('is-open');
  waffleTrigger.setAttribute('aria-expanded', 'true');
}

function closeWaffleList() {
  waffleList.hidden = true;
  waffleSelect.classList.remove('is-open');
  waffleTrigger.setAttribute('aria-expanded', 'false');
}

waffleTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (waffleList.hidden) {
    openWaffleList();
    // Opened with Enter/Space: move focus into the list.
    if (lastInput === 'keyboard') focusOption(currentOptionIndex());
  } else {
    closeWaffleList();
  }
  releaseFocusAfterPointer(waffleTrigger);
});

document.addEventListener('click', (e) => {
  // Outside the menu, or on the dimmed backdrop behind the phone sheet
  // (the backdrop belongs to #waffle-select itself, not to a row or button).
  if (!waffleSelect.contains(e.target) || e.target === waffleSelect) closeWaffleList();
});

// ── Collection list: keyboard ──────────────────
// ↓/↑ open the list from the menu button; inside it ↓/↑ move, Home/End jump,
// Enter/Space choose, Escape closes and returns to the button, Tab moves on.
function options() {
  return [...waffleList.querySelectorAll('.waffle-option')];
}

function currentOptionIndex() {
  return Math.max(0, options().findIndex(li => li.dataset.collection === state.collection));
}

function focusOption(i) {
  const list = options();
  if (!list.length) return;
  list[(i + list.length) % list.length].focus();
}

waffleTrigger.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    openWaffleList();
    focusOption(currentOptionIndex());
  }
});

waffleList.addEventListener('keydown', (e) => {
  const list = options();
  const i = list.indexOf(document.activeElement);
  if (e.key === 'ArrowDown')      { e.preventDefault(); focusOption(i + 1); }
  else if (e.key === 'ArrowUp')   { e.preventDefault(); focusOption(i - 1); }
  else if (e.key === 'Home')      { e.preventDefault(); focusOption(0); }
  else if (e.key === 'End')       { e.preventDefault(); focusOption(-1); }
  else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const id = document.activeElement.dataset.collection;
    if (id) selectCollection(id);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeWaffleList();
    waffleTrigger.focus();
  }
});

// Tabbing to another control closes the list. (Focus simply being released
// after a mouse click has no relatedTarget and must not close it.)
waffleSelect.addEventListener('focusout', (e) => {
  if (e.relatedTarget && !waffleSelect.contains(e.relatedTarget)) closeWaffleList();
});

// ── Level: segmented control (native radios, so arrow keys work) ──
function renderLevelSeg() {
  levelSeg.innerHTML = '';
  LEVELS.forEach(value => {
    const words = levelWords(state.collection, value);
    const label = document.createElement('label');
    label.className = 'seg-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'level';
    input.value = value;
    input.className = 'seg-input';
    input.checked = value === state.level;
    input.setAttribute('aria-label', words.full);
    const text = document.createElement('span');
    text.className = 'seg-text';
    text.setAttribute('aria-hidden', 'true');
    const main = document.createElement('span');
    main.className = 'seg-main';
    main.textContent = words.main;
    const sub = document.createElement('span');
    sub.className = 'seg-sub';
    sub.textContent = words.sub;
    text.append(main, sub);
    label.append(input, text);
    levelSeg.appendChild(label);
  });
}

levelSeg.addEventListener('change', (e) => {
  if (!e.target.matches('input')) return;
  state.level = e.target.value;
  // The Topic chips depend on the Level. The chosen Topic is kept: if it has
  // no Waffles at the new Level the page says so rather than widening.
  renderChips();
  syncUrl();
  refresh();
  releaseFocusAfterPointer(e.target);
});

// ── Topic: one scrolling row of chips ──────────
function addChip(value, text, { unavailable = false } = {}) {
  const label = document.createElement('label');
  label.className = 'chip' + (unavailable ? ' unavailable' : '');
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'topic';
  input.value = value;
  input.className = 'chip-input';
  input.checked = value === state.category;
  if (unavailable) input.setAttribute('aria-label', `${text}, no Waffles at this level`);
  const span = document.createElement('span');
  span.className = 'chip-text';
  span.textContent = text;
  label.append(input, span);
  chipScroll.appendChild(label);
}

function renderChips() {
  topicLabel.textContent = topicLabelFor(findCollection(state.collection));
  chipScroll.innerHTML = '';
  const list = topicsFor(state.collection, state.level);
  addChip('', 'All');
  list.forEach(c => addChip(c, c));
  // A Topic chosen earlier (or in the URL) that has no Waffles here stays
  // visible and selected, so the empty message is not a mystery.
  if (state.category && !list.includes(state.category)) {
    addChip(state.category, state.category, { unavailable: true });
  }
  scrollActiveChipIntoView(false);
  updateChipFades();
}

// Bring the chosen chip into view, leaving a sliver of the previous chip and
// the start of the next one visible so it is clear the row scrolls. A chip
// that is already comfortably visible is left alone.
const CHIP_FADE_L = 22, CHIP_FADE_R = 26, CHIP_LEAD = 30;
function scrollActiveChipIntoView(smooth) {
  const input = chipScroll.querySelector('input:checked');
  const chip = input && input.parentElement;
  if (!chip) return;
  const left = chip.offsetLeft, right = left + chip.offsetWidth;
  const viewL = chipScroll.scrollLeft, viewR = viewL + chipScroll.clientWidth;
  const visible = left >= viewL + (viewL > 0 ? CHIP_FADE_L : 0) &&
                  right <= viewR - (viewR < chipScroll.scrollWidth ? CHIP_FADE_R : 0);
  if (visible) return;
  const max = chipScroll.scrollWidth - chipScroll.clientWidth;
  const target = chip.previousElementSibling ? Math.max(0, Math.min(max, left - CHIP_LEAD)) : 0;
  chipScroll.scrollTo({ left: target, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
}

// Fade the edge(s) that have more chips beyond them
function updateChipFades() {
  const max = chipScroll.scrollWidth - chipScroll.clientWidth;
  chipWrap.classList.toggle('fade-l', chipScroll.scrollLeft > 2);
  chipWrap.classList.toggle('fade-r', chipScroll.scrollLeft < max - 2);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

chipScroll.addEventListener('scroll', updateChipFades, { passive: true });
window.addEventListener('resize', () => { scrollActiveChipIntoView(false); updateChipFades(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateChipFades);

// A mouse wheel has no horizontal axis: turn vertical wheel movement over the
// row into sideways scrolling (trackpads and touch already scroll sideways).
chipScroll.addEventListener('wheel', (e) => {
  if (chipScroll.scrollWidth <= chipScroll.clientWidth) return;
  if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
  const before = chipScroll.scrollLeft;
  chipScroll.scrollLeft += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
  if (chipScroll.scrollLeft !== before) e.preventDefault();
}, { passive: false });

function chooseTopic(value) {
  state.category = value;
  renderChips();   // drops an unavailable chip once something else is chosen
  syncUrl();
  refresh();
}

chipScroll.addEventListener('change', (e) => {
  if (!e.target.matches('input')) return;
  chooseTopic(e.target.value);
  // Smooth for a tap/click; instant for the keyboard, so holding an arrow key
  // never queues up animated scrolls that lag behind the selection.
  scrollActiveChipIntoView(lastInput === 'pointer');
  releaseFocusAfterPointer(e.target);
});

// "Show all topics" in the empty message: an explicit choice by the student.
emptyAllBtn.addEventListener('click', () => {
  chooseTopic('');
  releaseFocusAfterPointer(emptyAllBtn);
});

// Re-clicking an already-chosen option fires no change; still release focus
// after a mouse/tap so Space keeps meaning "Next".
[levelSeg, chipScroll].forEach(group => {
  group.addEventListener('click', (e) => {
    if (e.target.matches('input')) releaseFocusAfterPointer(e.target);
  });
});

// ── Draw the whole selector area for the current state ──
function renderAll() {
  renderTrigger();
  renderCollectionList();
  // General English: one mixed set, so no Level / Topic controls.
  levelRow.hidden = topicRow.hidden = isGeneral();
  mixedNote.hidden = !isGeneral();
  if (!isGeneral()) { renderLevelSeg(); renderChips(); }
}

// ── Keyboard focus after mouse use ────────────
// Space means "Next Waffle". After a button is clicked with the mouse,
// focus is released so the next Space press isn't taken by that button
// (e.g. Space after clicking Back would otherwise go back again).
// Keyboard users (Tab/Enter) keep normal focus behaviour.
let lastInput = 'keyboard';
document.addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);
document.addEventListener('keydown',     () => { lastInput = 'keyboard'; }, true);

function releaseFocusAfterPointer(el) {
  if (lastInput === 'pointer') el.blur();
}

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', () => { showWaffle(); releaseFocusAfterPointer(nextBtn); });
backBtn.addEventListener('click', () => { goBack();     releaseFocusAfterPointer(backBtn); });

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (!nextBtn.disabled) showWaffle();
  }
  if (e.key === 'Escape') closeWaffleList();
});

// ── Init ──────────────────────────────────────
readUrl();
renderAll();    // set up straight away so the page doesn't flash General first
syncUrl();
refresh();      // General shows at once; other Collections wait for the data
ready = true;

// The Collections' Waffles. Needed for the Topic chips and every Collection
// except General English.
fetch('data/waffles.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    allWaffles = data;
    if (!isGeneral()) { renderChips(); refresh(); }
  })
  .catch(err => {
    loadFailed = true;
    if (!isGeneral()) refresh();
    console.error('[WaffleBrain]', err);
  });

// ── Offline support ───────────────────────────
// Registers sw.js, which saves WaffleBrain (pages + all Waffles) so it keeps
// working if the connection drops. Silently skipped where unsupported.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('[WaffleBrain] Offline support unavailable:', err));
  });
}
