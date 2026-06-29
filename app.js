// ─────────────────────────────────────────────
//  WaffleBrain — app.js
//  Teacher interface controller.
//  Depends on engine.js (WB must be in scope).
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const promptCard     = document.getElementById('prompt-card');
const modeLabel      = document.getElementById('mode-label');
const promptText     = document.getElementById('prompt-text');
const constraintText = document.getElementById('constraint-text');
const counter        = document.getElementById('counter');
const nextBtn        = document.getElementById('next-btn');
const backBtn        = document.getElementById('back-btn');
const copyBtn        = document.getElementById('copy-btn');
const categorySelect = document.getElementById('category-select');
const levelSelect    = document.getElementById('level-select');

const levelDisplay    = document.getElementById('level-display');

// ── History ───────────────────────────────────
// Each entry: { category, prompt, constraint, shown }
const history = [];
let historyIndex = -1;

// ── Active filter ─────────────────────────────
function getFilter() {
  return categorySelect ? categorySelect.value : '';
}

// ── Student level ─────────────────────────────
// Reflects the teacher's current selection. Default: B1.
// Not yet wired into prompt generation — stored for future use.
let currentLevel = 'B1';

function getLevel() {
  return currentLevel;
}

// ── Level display ─────────────────────────────
const levelLabels = {
  A1:   'A1 Beginner',
  A2:   'A2 Elementary',
  B1:   'B1 Intermediate',
  B1B2: 'B1/B2 Upper Intermediate',
  B2:   'B2 Advanced',
};

function updateLevelDisplay() {
  if (levelDisplay) {
    levelDisplay.textContent = `Student level: ${levelLabels[currentLevel] ?? currentLevel}`;
  }
}

// ── Render a prompt object to the UI ──────────
function renderPrompt(p) {
  modeLabel.textContent      = p.category;
  promptText.textContent     = p.prompt;
  constraintText.textContent = p.constraint;
  counter.textContent        = `${p.shown} shown`;

  promptCard.setAttribute('data-mode', p.category);

  promptCard.classList.remove('flash');
  void promptCard.offsetWidth;
  promptCard.classList.add('flash');
  setTimeout(() => promptCard.classList.remove('flash'), 350);

  backBtn.disabled = historyIndex <= 0;
}

// ── Draw a new prompt and push to history ─────
function showPrompt() {
  const p = WB.draw(getFilter(), getLevel());
  const entry = {
    category:   p.category,
    prompt:     p.prompt,
    constraint: p.constraint,
    shown:      WB.getShown()
  };

  // If we went back and now go forward again, discard the forward branch
  history.splice(historyIndex + 1);

  history.push(entry);
  historyIndex = history.length - 1;

  renderPrompt(entry);
}

// ── Step back through history ─────────────────
function showPrev() {
  if (historyIndex <= 0) return;
  historyIndex--;
  renderPrompt(history[historyIndex]);
}

// ── Init ──────────────────────────────────────
WB.load()
  .then(() => {
    nextBtn.disabled = false;
    localStorage.setItem('wb_level', currentLevel);
    updateLevelDisplay();
    WB.prime(getFilter(), getLevel());
    showPrompt();
  })
  .catch(err => {
    modeLabel.textContent      = 'Error';
    promptText.textContent     = 'Could not load prompts.';
    constraintText.textContent = err.message + ' — Check that data/prompts.json exists and the app is served over HTTP.';
    promptCard.setAttribute('data-mode', '');
    counter.textContent = '—';
    console.error('[WaffleBrain]', err);
  });

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', showPrompt);
backBtn.addEventListener('click', showPrev);

levelSelect.addEventListener('change', () => {
  currentLevel = levelSelect.value;
  localStorage.setItem('wb_level', currentLevel);
  updateLevelDisplay();
  WB.prime(getFilter(), getLevel());
});

categorySelect.addEventListener('change', () => {
  const isFiltered = categorySelect.value !== '';
  categorySelect.classList.toggle('filtered', isFiltered);
  // Reset history when filter changes — back would cross category contexts
  history.length = 0;
  historyIndex = -1;
  WB.prime(getFilter(), getLevel());
  showPrompt();
});

let copyResetTimer = null;

copyBtn.addEventListener('click', () => {
  const category   = modeLabel.textContent;
  const prompt     = promptText.textContent;
  const constraint = constraintText.textContent;
  const text = `${category}\n\n${prompt}\n\nLanguage Focus: ${constraint}`;

  const resetCopyBtn = () => {
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
      <path d="M8 4V2.8A.8.8 0 0 0 7.2 2H1.8A.8.8 0 0 0 1 2.8v5.4c0 .44.36.8.8.8H4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg> Copy prompt`;
  };

  const setCopied = () => {
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1.5 6.5 L4.5 9.5 L10.5 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg> Copied`;
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(resetCopyBtn, 1000);
  };

  navigator.clipboard.writeText(text).then(setCopied).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setCopied();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    if (!nextBtn.disabled) showPrompt();
  }
});