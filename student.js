// ─────────────────────────────────────────────
//  WaffleBrain — student.js
//  Student interface controller.
//
//  Fresh architecture: the student page shows one random
//  standalone Waffle from studentSupport.js. It never shows a
//  teacher prompt, topic, or category — the teacher decides what
//  to discuss; this page just gets the student talking.
//
//  Depends on studentSupport.js (WAFFLES).
//
//  Collections: opened as student.html?collection=business&level=B1
//  (the Teacher page's "Student" link adds these), the page instead
//  shows the Student Waffles of that Collection + level from
//  data/waffles.json — the student text only, never the teacher text
//  or Language Focus. Those records have no Goal or Starters, so those
//  sections are hidden. Without a Collection (or for General English)
//  the standalone Waffles above are shown, as before.
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const promptCard      = document.getElementById('prompt-card');
const waffleSection    = document.getElementById('waffle-section');
const goalSection      = document.getElementById('goal-section');
const startersSection  = document.getElementById('starters-section');

const waffleText   = document.getElementById('waffle-text');
const goalText     = document.getElementById('goal-text');
const startersList = document.getElementById('starters-list');

const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');

// ── History ───────────────────────────────────
const waffleHistory = [];   // stores Waffle objects already shown
let   currentWaffle = null; // the Waffle currently on screen

// ── Waffles to draw from ──────────────────────
// The standalone WAFFLES, or a Collection's Student Waffles (see init).
let pool = WAFFLES;

// ── Random Waffle picker ──────────────────────
// Picks a random Waffle from the pool, avoiding an immediate repeat of
// the Waffle currently on screen whenever there's more than one to choose from.
function pickRandomWaffle() {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  let next;
  do {
    next = pool[Math.floor(Math.random() * pool.length)];
  } while (next === currentWaffle);

  return next;
}

// ── Render ─────────────────────────────────────
function renderWaffle(w) {
  currentWaffle = w;

  // 🧇 Waffle — the speaking mission
  waffleText.textContent = w.waffle;

  // 🎯 Goal and 💬 Starters exist only on the standalone Waffles;
  // Collection Waffles have neither, so their sections are hidden.
  goalSection.style.display     = w.goal ? '' : 'none';
  startersSection.style.display = w.starters ? '' : 'none';

  // 🎯 Goal — why this Waffle matters
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
}

// ── Display (draws new Waffle, saves current to history) ──
function showWaffle() {
  if (currentWaffle !== null) {
    waffleHistory.push(currentWaffle);
  }
  renderWaffle(pickRandomWaffle());
}

// ── Go back ───────────────────────────────────
function goBack() {
  if (waffleHistory.length === 0) return;
  renderWaffle(waffleHistory.pop());
}

// ── Init ──────────────────────────────────────
function start() {
  if (Array.isArray(pool) && pool.length > 0) {
    nextBtn.disabled = false;
    showWaffle();
  } else {
    waffleText.textContent = 'Could not load Waffles.';
    if (goalSection) goalSection.style.display = 'none';
    if (startersSection) startersSection.style.display = 'none';
    console.error('[WaffleBrain] No Waffles to show.');
  }
}

// ?collection=…&level=… → that Collection's Student Waffles from
// data/waffles.json (all levels if the level is missing or unknown).
const params          = new URLSearchParams(location.search);
const collectionParam = params.get('collection');
const levelParam      = params.get('level');

if (collectionParam && collectionParam !== 'general') {
  fetch('data/waffles.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const inCollection = data.filter(w => w.collection === collectionParam);
      const atLevel      = inCollection.filter(w => w.level === levelParam);
      if (inCollection.length) {   // unknown Collection → standalone Waffles
        pool = (atLevel.length ? atLevel : inCollection)
          .map(w => ({ id: w.id, waffle: w.student.prompt }));
      }
      start();
    })
    .catch(err => {
      pool = [];
      start();
      console.error('[WaffleBrain]', err);
    });
} else {
  start();
}

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', showWaffle);
backBtn.addEventListener('click', goBack);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (!nextBtn.disabled) showWaffle();
  }
});
