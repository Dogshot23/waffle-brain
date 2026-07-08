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

// ── Random Waffle picker ──────────────────────
// Picks a random Waffle from WAFFLES, avoiding an immediate repeat of
// the Waffle currently on screen whenever there's more than one to choose from.
function pickRandomWaffle() {
  if (!Array.isArray(WAFFLES) || WAFFLES.length === 0) return null;
  if (WAFFLES.length === 1) return WAFFLES[0];

  let next;
  do {
    next = WAFFLES[Math.floor(Math.random() * WAFFLES.length)];
  } while (next === currentWaffle);

  return next;
}

// ── Render ─────────────────────────────────────
function renderWaffle(w) {
  currentWaffle = w;

  // 🧇 Waffle — the speaking mission
  waffleText.textContent = w.waffle;

  // 🎯 Goal — why this Waffle matters
  goalText.textContent = w.goal;

  // 💬 Waffle Starters — always visible, never collapsible
  startersList.innerHTML = '';
  w.starters.forEach(starter => {
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
if (Array.isArray(WAFFLES) && WAFFLES.length > 0) {
  nextBtn.disabled = false;
  showWaffle();
} else {
  waffleText.textContent = 'Could not load Waffles.';
  if (goalSection) goalSection.style.display = 'none';
  if (startersSection) startersSection.style.display = 'none';
  console.error('[WaffleBrain] WAFFLES is missing or empty.');
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
