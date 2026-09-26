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
const nextBtn        = document.getElementById('next-btn');
const backBtn        = document.getElementById('back-btn');
const copyBtn        = document.getElementById('copy-btn');
const categorySelect = document.getElementById('category-select');
const levelSelect    = document.getElementById('level-select');

const levelDisplay    = document.getElementById('level-display');

const waffleSelect       = document.getElementById('waffle-select');
const waffleTrigger      = document.getElementById('waffle-trigger');
const waffleTriggerIcon  = document.getElementById('waffle-trigger-icon');
const waffleTriggerLabel = document.getElementById('waffle-trigger-label');
const waffleList         = document.getElementById('waffle-list');

// ── Collection selector ────────────────────────
// A Collection is a group of Waffles (General English, IELTS, …).
// The DOM ids/classes below (waffle-select, waffle-list, …) are legacy
// names that refer to this Collection dropdown.
// Stage 1: rendering only. Selecting "General English" does not change
// app behaviour — it is the only unlocked Collection and the app already
// behaves as if it were selected. Locked Collections are inert (no modal
// yet — that's a later stage). Adding a future Collection should mean
// adding an entry here, not touching the markup or render logic.
const COLLECTIONS = [
  { id: 'general',           name: 'General English',  icon: '🧇', locked: false, comingSoon: false },
  { id: 'ielts',              name: 'IELTS',             locked: true,  comingSoon: true },
  { id: 'kids',               name: 'Kids',              locked: true,  comingSoon: true },
  { id: 'business',           name: 'Business',          locked: true,  comingSoon: true },
  { id: 'cambridge',          name: 'Cambridge',         locked: true,  comingSoon: true },
  { id: 'travel',             name: 'Travel',            locked: true,  comingSoon: true },
  { id: 'debate',             name: 'Debate',            locked: true,  comingSoon: true },
  { id: 'medical',            name: 'Medical',           locked: true,  comingSoon: true },
  { id: 'conversation-club',  name: 'Conversation Club', locked: true,  comingSoon: true },
];

let currentCollection = 'general';

function renderCollectionList() {
  waffleList.innerHTML = '';
  let separatorAdded = false;

  COLLECTIONS.forEach(w => {
    if (w.locked && !separatorAdded) {
      const sep = document.createElement('li');
      sep.className = 'waffle-separator';
      sep.setAttribute('role', 'presentation');
      sep.textContent = 'Coming Soon';
      waffleList.appendChild(sep);
      separatorAdded = true;
    }

    const li = document.createElement('li');
    li.className = 'waffle-option' + (w.locked ? ' locked' : '');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(w.id === currentCollection));
    if (w.locked) li.setAttribute('aria-disabled', 'true');

    const icon = document.createElement('span');
    icon.className = 'waffle-option-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = w.locked ? '🔒' : (w.icon || '🧇');

    const label = document.createElement('span');
    label.className = 'waffle-option-label';
    label.textContent = w.name;

    li.appendChild(icon);
    li.appendChild(label);

    if (w.locked && w.comingSoon) {
      const tag = document.createElement('span');
      tag.className = 'waffle-option-tag';
      tag.textContent = 'Soon';
      li.appendChild(tag);
    }

    li.addEventListener('click', () => {
      // Locked Collections do nothing yet — no navigation, no modal.
      if (w.locked) return;
      selectCollection(w.id);
    });

    waffleList.appendChild(li);
  });
}

function selectCollection(id) {
  const collection = COLLECTIONS.find(c => c.id === id);
  if (!collection || collection.locked) return;
  currentCollection = id;
  waffleTriggerIcon.textContent = collection.icon || '🧇';
  waffleTriggerLabel.textContent = collection.name;
  closeWaffleList();
  renderCollectionList();
}

function openWaffleList() {
  waffleList.hidden = false;
  waffleTrigger.setAttribute('aria-expanded', 'true');
}

function closeWaffleList() {
  waffleList.hidden = true;
  waffleTrigger.setAttribute('aria-expanded', 'false');
}

waffleTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (waffleList.hidden) openWaffleList(); else closeWaffleList();
});

document.addEventListener('click', (e) => {
  if (!waffleSelect.contains(e.target)) closeWaffleList();
});

renderCollectionList();

// ── History ───────────────────────────────────
// Each entry: { id, shown } — id is the permanent Waffle ID;
// the record itself is looked up with WB.getById(id).
const history = [];
let historyIndex = -1;

// ── Active filter ─────────────────────────────
function getFilter() {
  return categorySelect ? categorySelect.value : '';
}

// ── Student level ─────────────────────────────
// Reflects the teacher's current selection. Default: A1A2.
// Must exactly match both the option values in index.html AND the
// `level` values in data/waffles.json. These three strings are the
// single source of truth for valid levels.
const LEVELS = ['A1A2', 'B1', 'B2+'];

const savedLevel = localStorage.getItem('wb_level');
let currentLevel = LEVELS.includes(savedLevel) ? savedLevel : 'A1A2';

function getLevel() {
  return currentLevel;
}

// ── Level display ─────────────────────────────
const levelLabels = {
  A1A2: 'A1/A2 Beginner',
  B1:   'B1 Intermediate',
  'B2+': 'B2+ Advanced',
};

function updateLevelDisplay() {
  if (levelDisplay) {
    levelDisplay.textContent = `Student level: ${levelLabels[currentLevel] ?? currentLevel}`;
  }
}

// ── Format prompt text for display ───────────
// Converts \n-delimited prompt strings into scannable HTML:
//   • Lines ending with ':' → small bold section labels
//   • Lines after a label   → bullet-list items
//   • Lines before any label→ intro paragraph(s)
// Does not touch prompt content — purely presentational.
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatPrompt(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let html = '';
  let inList = false;

  for (const line of lines) {
    const safe = escHtml(line);
    // Section header: short line ending with ':'
    if (line.endsWith(':') && line.length < 60) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<span class="prompt-section">${safe}</span>`;
      html += '<ul class="prompt-list">';
      inList = true;
    } else if (inList) {
      html += `<li>${safe}</li>`;
    } else {
      html += `<p class="prompt-intro">${safe}</p>`;
    }
  }

  if (inList) html += '</ul>';
  return html;
}

// ── Render a history entry's Teacher Waffle to the UI ──
function renderPrompt(entry) {
  const w = WB.getById(entry.id);
  modeLabel.textContent      = w.category;
  promptText.innerHTML       = formatPrompt(w.teacher.prompt);
  constraintText.textContent = w.teacher.constraint;

  promptCard.setAttribute('data-mode', w.category);
  promptCard.setAttribute('data-waffle-id', w.id);

  promptCard.classList.remove('flash');
  void promptCard.offsetWidth;
  promptCard.classList.add('flash');
  setTimeout(() => promptCard.classList.remove('flash'), 350);

  backBtn.disabled = historyIndex <= 0;
}

// ── Draw a new prompt and push to history ─────
function showPrompt() {
  const w = WB.draw(getFilter(), getLevel(), currentCollection);
  const entry = {
    id:    w.id,
    shown: WB.getShown()
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
    levelSelect.value = currentLevel;
    localStorage.setItem('wb_level', currentLevel);
    updateLevelDisplay();
    WB.prime(getFilter(), getLevel(), currentCollection);
    showPrompt();
  })
  .catch(err => {
    modeLabel.textContent      = 'Error';
    promptText.textContent     = 'Could not load prompts.';
    constraintText.textContent = err.message + ' — Check that data/waffles.json exists and the app is served over HTTP.';
    promptCard.setAttribute('data-mode', '');
    console.error('[WaffleBrain]', err);
  });

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', showPrompt);
backBtn.addEventListener('click', showPrev);

levelSelect.addEventListener('change', () => {
  currentLevel = levelSelect.value;
  localStorage.setItem('wb_level', currentLevel);
  updateLevelDisplay();
  WB.prime(getFilter(), getLevel(), currentCollection);
});

categorySelect.addEventListener('change', () => {
  const isFiltered = categorySelect.value !== '';
  categorySelect.classList.toggle('filtered', isFiltered);
  // Reset history when filter changes — back would cross category contexts
  history.length = 0;
  historyIndex = -1;
  WB.prime(getFilter(), getLevel(), currentCollection);
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
  if (e.key === 'Escape') {
    closeWaffleList();
  }
});