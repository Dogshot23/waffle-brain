// ─────────────────────────────────────────────
//  WaffleBrain — student.js
//  Student interface controller.
//  Depends on engine.js (WB must be in scope).
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const promptCard    = document.getElementById('prompt-card');
const modeLabel     = document.getElementById('mode-label');
const promptText    = document.getElementById('prompt-text');
const practiceList  = document.getElementById('practice-list');
const starterList   = document.getElementById('starter-list');
const followUpText  = document.getElementById('follow-up-text');
const nextBtn       = document.getElementById('next-btn');
const backBtn       = document.getElementById('back-btn');

// ── History ───────────────────────────────────
const promptHistory = [];   // stores prompt objects already shown
let   currentPrompt = null; // the prompt currently on screen

// ── Shared level (set by teacher page) ────────
function getSharedLevel() {
  return localStorage.getItem('wb_level') || 'B1';
}

// ── Render (does NOT call WB.draw) ───────────
function renderPrompt(p) {
  currentPrompt = p;

  // Category badge
  modeLabel.textContent = p.category;
  promptCard.setAttribute('data-mode', p.category);

  // Main prompt
  promptText.textContent = p.studentPrompt;

  // Practice list — clear and rebuild
  practiceList.innerHTML = '';
  p.studentPractice.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    practiceList.appendChild(li);
  });

  // Starter phrases — clear and rebuild
  starterList.innerHTML = '';
  p.studentStarter.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    starterList.appendChild(li);
  });

  // Follow-up question
  followUpText.textContent = p.studentFollowUp;

  // Flash
  promptCard.classList.remove('flash');
  void promptCard.offsetWidth;
  promptCard.classList.add('flash');
  setTimeout(() => promptCard.classList.remove('flash'), 350);

  // Back button: enabled only when there is history to return to
  backBtn.disabled = promptHistory.length === 0;
}

// ── Display (draws new prompt, saves current to history) ──
function showPrompt() {
  if (currentPrompt !== null) {
    promptHistory.push(currentPrompt);
  }
  renderPrompt(WB.draw('', getSharedLevel()));
}

// ── Go back ───────────────────────────────────
function goBack() {
  if (promptHistory.length === 0) return;
  renderPrompt(promptHistory.pop());
}

// ── Init ──────────────────────────────────────
WB.load()
  .then(() => {
    nextBtn.disabled = false;
    WB.prime();
    showPrompt();
  })
  .catch(err => {
    modeLabel.textContent    = 'Error';
    promptText.textContent   = 'Could not load prompts.';
    followUpText.textContent = err.message;
    promptCard.setAttribute('data-mode', '');
    console.error('[WaffleBrain]', err);
  });

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', showPrompt);
backBtn.addEventListener('click', goBack);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (!nextBtn.disabled) showPrompt();
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === 'wb_level' && !nextBtn.disabled) {
    WB.prime('', getSharedLevel());
  }
});