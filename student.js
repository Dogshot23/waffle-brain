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

// ── Display ───────────────────────────────────
function showPrompt() {
  const p = WB.draw();

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

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (!nextBtn.disabled) showPrompt();
  }
});