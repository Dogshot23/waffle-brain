// ─────────────────────────────────────────────
//  WaffleBrain — student.js
//  Student interface controller.
//  Depends on engine.js (WB) and studentSupport.js (STUDENT_SUPPORT).
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const promptCard        = document.getElementById('prompt-card');
const modeLabel         = document.getElementById('mode-label');
const promptText        = document.getElementById('prompt-text');
const nextBtn           = document.getElementById('next-btn');
const backBtn           = document.getElementById('back-btn');

const usefulEnglishList  = document.getElementById('useful-english-list');
const trySayingList      = document.getElementById('try-saying-list');
const keepGoingText      = document.getElementById('keep-going-text');
const challengeText      = document.getElementById('challenge-text');
const supportSection     = document.getElementById('support-section');

// ── History ───────────────────────────────────
const promptHistory = [];   // stores prompt objects already shown
let   currentPrompt = null; // the prompt currently on screen

// ── Shared level (set by teacher page) ────────
function getSharedLevel() {
  return localStorage.getItem('wb_level') || 'B1';
}

// ── Support lookup ────────────────────────────
// Falls back to an empty-but-safe shape if a level/category
// combination is missing from STUDENT_SUPPORT. The validation
// pass below should catch this during load, but this keeps
// rendering safe even if that check is ever bypassed.
const EMPTY_SUPPORT = {
  usefulEnglish: [],
  trySaying: [],
  keepGoing: '',
  challenge: ''
};

function getSupport(level, category) {
  const levelEntry = STUDENT_SUPPORT && STUDENT_SUPPORT[level];
  const entry = levelEntry && levelEntry[category];
  return entry || EMPTY_SUPPORT;
}

// ── Validation ─────────────────────────────────
// Confirms every level/category found in prompts.json has a
// matching entry in STUDENT_SUPPORT. Missing combinations are
// logged clearly but never block rendering.
function validateStudentSupport(rawPromptData) {
  Object.keys(rawPromptData).forEach(level => {
    Object.keys(rawPromptData[level]).forEach(category => {
      const levelEntry = STUDENT_SUPPORT && STUDENT_SUPPORT[level];
      if (!levelEntry || !levelEntry[category]) {
        console.error(
          `[WaffleBrain] Missing studentSupport.js entry for level "${level}", ` +
          `category "${category}". Add STUDENT_SUPPORT["${level}"]["${category}"] ` +
          `with usefulEnglish, trySaying, keepGoing, and challenge.`
        );
      }
    });
  });
}

// ── Render support blocks ─────────────────────
function renderList(listEl, items) {
  listEl.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listEl.appendChild(li);
  });
}

function renderSupport(level, category) {
  const support = getSupport(level, category);
  renderList(usefulEnglishList, support.usefulEnglish);
  renderList(trySayingList, support.trySaying);
  keepGoingText.textContent = support.keepGoing;
  challengeText.textContent = support.challenge;
}

// ── Render (does NOT call WB.draw) ───────────
function renderPrompt(p) {
  currentPrompt = p;

  // Category badge
  modeLabel.textContent = p.category;
  promptCard.setAttribute('data-mode', p.category);

  // Main prompt
  promptText.textContent = p.prompt;

  // Student support (looked up separately from prompt selection)
  renderSupport(getSharedLevel(), p.category);

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
  .then((rawPromptData) => {
    validateStudentSupport(rawPromptData);
    nextBtn.disabled = false;
    WB.prime();
    showPrompt();
  })
  .catch(err => {
    modeLabel.textContent  = 'Error';
    promptText.textContent = `Could not load prompts. ${err.message}`;
    promptCard.setAttribute('data-mode', '');
    if (supportSection) supportSection.style.display = 'none';
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
