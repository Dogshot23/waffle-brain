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

// Visible Level / Activity controls (views of the two selects above).
const levelSeg      = document.getElementById('level-seg');
const chipWrap      = document.getElementById('chip-wrap');
const chipScroll    = document.getElementById('chip-scroll');
const activityLabel = document.getElementById('activity-label');
const selectorNote  = document.getElementById('selector-note');

const levelDisplay    = document.getElementById('level-display');
// Found by id, not by its href: Netlify's pretty URLs serve href="student.html" as "/student".
const studentLink     = document.getElementById('student-link');

const waffleSelect       = document.getElementById('waffle-select');
const waffleTrigger      = document.getElementById('waffle-trigger');
const waffleTriggerIcon  = document.getElementById('waffle-trigger-icon');
const waffleTriggerLabel = document.getElementById('waffle-trigger-label');
const waffleList         = document.getElementById('waffle-list');

// ── Collection selector ────────────────────────
// A Collection is a group of Waffles (General English, IELTS, …).
// The list itself (COLLECTIONS) lives in collections.js, shared with the
// Student page and scripts/validate.js.
// The DOM ids/classes below (waffle-select, waffle-list, …) are legacy
// names that refer to this Collection dropdown.
let currentCollection = 'general';

// A premium Collection (isPremium in collections.js) this browser has not
// unlocked (see js/payment.js). Choosing it opens the paywall instead.
function isLockedPremium(c) {
  return !!(c && c.isPremium && !WaffleAccess.isProUnlocked());
}

// The menu: one heading per COLLECTION_GROUPS entry (collections.js), each
// followed by its Collections in COLLECTIONS order. A row is the emoji, the
// name, a small PREMIUM tag for premium Collections (never greyed out —
// choosing a locked one opens the paywall) and, quietly on the right, how
// many Waffles the Collection has (filled in once waffles.json has loaded).
function renderCollectionList() {
  waffleList.innerHTML = '';

  COLLECTION_GROUPS.forEach(group => {
    const members = COLLECTIONS.filter(c => c.group === group.id);
    if (!members.length) return;

    const heading = document.createElement('li');
    heading.className = 'waffle-group';
    heading.setAttribute('role', 'presentation');
    heading.textContent = group.title;
    waffleList.appendChild(heading);

    members.forEach(w => {
      const li = document.createElement('li');
      li.className = 'waffle-option' + (w.locked ? ' locked' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(w.id === currentCollection));
      li.dataset.collection = w.id;
      // Focusable from the keyboard (arrow keys), but not a Tab stop.
      li.tabIndex = -1;
      if (w.locked) li.setAttribute('aria-disabled', 'true');

      const icon = document.createElement('span');
      icon.className = 'waffle-option-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = w.icon || '🧇';

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

      if (w.isPremium) {
        const tag = document.createElement('span');
        tag.className = 'waffle-option-premium';
        tag.setAttribute('aria-hidden', 'true');
        tag.textContent = 'Premium';
        li.appendChild(tag);
        li.setAttribute('aria-label', `${w.name}, premium${isLockedPremium(w) ? ', locked' : ''}`);
      }

      const n = WB.getCollectionCount(w.id);
      if (n) {
        const count = document.createElement('span');
        count.className = 'waffle-option-count';
        count.textContent = String(n);
        li.appendChild(count);
      }

      li.addEventListener('click', () => chooseCollection(w));

      waffleList.appendChild(li);
    });
  });
}

// Choose a Collection from the list (by mouse, tap or keyboard).
function chooseCollection(w) {
  // Locked Collections do nothing yet — no navigation, no modal.
  if (w.locked) return;
  // Premium and not unlocked: show the paywall and stay where we are.
  if (isLockedPremium(w)) {
    closeWaffleList();
    openPaywall();
    return;
  }
  const byKeyboard = lastInput === 'keyboard';
  selectCollection(w.id);   // also closes the list
  // The list is redrawn on every choice, so hand keyboard focus back to
  // the menu button (a mouse or tap leaves focus free for Space = Next).
  if (byKeyboard) waffleTrigger.focus();
}

// Per-Collection styling hook (body[data-collection] in style.css) and the
// PREMIUM tag above the Collection menu button.
function applyCollectionLook(collection) {
  document.body.dataset.collection = collection.id;
  // PREMIUM tag beside the "Collection" label above the menu button.
  document.getElementById('waffle-premium-tag').hidden = !collection.isPremium;
}

// ── Paywall (premium Collections) ─────────────
// A <dialog> opened as a modal: it keeps keyboard focus inside, closes on
// Escape, and makes the page behind it inert. The checkout itself is in
// js/payment.js (handleStripeCheckout).
const paywall        = document.getElementById('paywall');
const paywallCta     = document.getElementById('paywall-cta');
const paywallBack    = document.getElementById('paywall-back');
const paywallMessage = document.getElementById('paywall-message');
const PAYWALL_CTA_TEXT = paywallCta.textContent;

function openPaywall() {
  paywallMessage.textContent = '';
  paywallCta.disabled = false;
  paywallCta.textContent = PAYWALL_CTA_TEXT;
  if (typeof paywall.showModal === 'function') paywall.showModal();
  else paywall.setAttribute('open', '');   // very old browsers
  paywallCta.focus();
}

function closePaywall() {
  if (typeof paywall.close === 'function') paywall.close();
  else paywall.removeAttribute('open');
}

paywallCta.addEventListener('click', async () => {
  paywallCta.disabled = true;
  paywallCta.textContent = 'Opening secure checkout…';
  const problem = await handleStripeCheckout();   // redirects to Stripe when set up
  paywallCta.disabled = false;
  paywallCta.textContent = PAYWALL_CTA_TEXT;
  paywallMessage.textContent = problem || '';
});

// "Back to Free Collections": close and go to General English.
paywallBack.addEventListener('click', () => {
  closePaywall();
  selectCollection('general');
  waffleTrigger.focus();
});

// A click on the dimmed backdrop (outside the box) closes it too.
paywall.addEventListener('click', (e) => {
  if (e.target === paywall) closePaywall();
});

// Category dropdown options for a Collection at a level. Every Collection
// works the same way: the options are the categories that actually have
// Waffles in waffles.json for that Collection + level, so an empty choice
// can never be offered. The list in index.html is only used for ORDER:
// categories it names come first, in its order (General, Business); any
// others follow in the order they first appear in the Collection in
// waffles.json (the same at every level, so the menu order never shuffles).
const DEFAULT_CATEGORIES = [...categorySelect.options].map(o => o.value).filter(Boolean);

function categoriesFor(collectionId, level) {
  const inOrder = WB.getCollectionCategories(collectionId);   // all levels, file order
  const rank = (c) => {
    const i = DEFAULT_CATEGORIES.indexOf(c);
    return i === -1 ? DEFAULT_CATEGORIES.length + inOrder.indexOf(c) : i;
  };
  return WB.getCollectionCategories(collectionId, level).sort((a, b) => rank(a) - rank(b));
}

// Rebuilds the Category menu for the Collection and the CURRENT level. If
// the selected category has no Waffles there (e.g. Kids › Gaming & Pixel
// Worlds, then switching to B2+), the selection falls back to All Categories.
function renderCategoryOptions(collectionId) {
  const current = categorySelect.value;
  const list = categoriesFor(collectionId, currentLevel);
  categorySelect.innerHTML = '';
  [['', 'All Categories'], ...list.map(c => [c, c])].forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    categorySelect.appendChild(opt);
  });
  categorySelect.value = list.includes(current) ? current : '';
  categorySelect.classList.toggle('filtered', categorySelect.value !== '');
  renderActivityChips();   // the visible chip row mirrors these options
}

function selectCollection(id, { resetDraw = true } = {}) {
  const collection = COLLECTIONS.find(c => c.id === id);
  if (!collection || collection.locked || isLockedPremium(collection)) return;
  const changed = id !== currentCollection;
  currentCollection = id;
  waffleTriggerIcon.textContent = collection.icon || '🧇';
  waffleTriggerLabel.textContent = collection.name;
  applyCollectionLook(collection);
  renderCategoryOptions(id);
  closeWaffleList();
  renderCollectionList();

  // A different Collection is a different pool of Waffles: reset history
  // and the shuffle-bag, and show a Waffle from the new Collection straight
  // away — the same as a level or category change. Skipped when restoring
  // a saved place, because init primes and renders that itself.
  if (changed && resetDraw) {
    history.length = 0;
    historyIndex = -1;
    WB.prime(getFilter(), getLevel(), currentCollection);
    showPrompt();
  }
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
// Standard listbox keys: ↓/↑ open the list from the menu button; inside
// it ↓/↑ move, Home/End jump, Enter/Space choose, Escape closes and
// returns to the button, and Tab moves on (closing the list).
function selectableOptions() {
  return [...waffleList.querySelectorAll('.waffle-option:not(.locked)')];
}

function currentOptionIndex() {
  return Math.max(0, selectableOptions().findIndex(li => li.dataset.collection === currentCollection));
}

function focusOption(i) {
  const options = selectableOptions();
  if (!options.length) return;
  options[(i + options.length) % options.length].focus();
}

waffleTrigger.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    openWaffleList();
    focusOption(currentOptionIndex());
  }
});

waffleList.addEventListener('keydown', (e) => {
  const options = selectableOptions();
  const i = options.indexOf(document.activeElement);
  if (e.key === 'ArrowDown')      { e.preventDefault(); focusOption(i + 1); }
  else if (e.key === 'ArrowUp')   { e.preventDefault(); focusOption(i - 1); }
  else if (e.key === 'Home')      { e.preventDefault(); focusOption(0); }
  else if (e.key === 'End')       { e.preventDefault(); focusOption(-1); }
  else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const w = COLLECTIONS.find(c => c.id === document.activeElement.dataset.collection);
    if (w) chooseCollection(w);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeWaffleList();
    waffleTrigger.focus();
  }
});

// Tabbing to another control closes the list. (Focus simply being released
// after a mouse click has no relatedTarget and must not close it; clicks
// outside the menu are handled by the document click listener above.)
waffleSelect.addEventListener('focusout', (e) => {
  if (e.relatedTarget && !waffleSelect.contains(e.relatedTarget)) closeWaffleList();
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
  promptCard.classList.remove('empty');
  nextBtn.disabled = false;
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
  saveTeacherState();
  updateStudentLink();
}

// ── Student link ──────────────────────────────
// For a Collection other than General English, the "Student" link opens
// that Collection's Student Waffles at the current level — and, when a
// category is selected, only that category. General English keeps the
// plain link (the standalone Student Waffles).
function updateStudentLink() {
  if (!studentLink) return;
  if (currentCollection === 'general') { studentLink.href = 'student.html'; return; }
  const params = new URLSearchParams({ collection: currentCollection, level: currentLevel });
  if (getFilter()) params.set('category', getFilter());
  studentLink.href = `student.html?${params}`;
}

// ── Empty state ───────────────────────────────
// The current Collection + level + category has no Waffles (e.g. a
// category a Collection doesn't use yet). Clear the card so no Waffle from
// another filter stays on screen, and disable Next/Back until the teacher
// picks a filter that has Waffles (renderPrompt restores everything).
function renderEmpty() {
  promptCard.classList.add('empty');
  modeLabel.textContent      = getFilter();
  promptText.innerHTML       = formatPrompt('No Waffles in this category yet.');
  constraintText.textContent = '';
  promptCard.setAttribute('data-mode', getFilter());
  promptCard.removeAttribute('data-waffle-id');
  nextBtn.disabled = true;
  backBtn.disabled = true;
  updateStudentLink();
}

// ── Keep the teacher's place for this browser tab ──
// Saved on every render so that Teacher → Student → Teacher (or a
// reload) returns to the same Waffle, filters and Back history.
// sessionStorage is per-tab and is cleared when the tab is closed.
const STATE_KEY = 'wb_teacher_state';

function saveTeacherState() {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      collection: currentCollection,
      level:      currentLevel,
      category:   getFilter(),
      history,
      historyIndex,
    }));
  } catch (e) { /* storage unavailable — keep working without it */ }
}

// Returns the saved state only if every part of it is still valid.
function loadTeacherState() {
  try {
    const s = JSON.parse(sessionStorage.getItem(STATE_KEY));
    if (!s || !LEVELS.includes(s.level)) return null;
    const collection = COLLECTIONS.find(c => c.id === s.collection && !c.locked && !isLockedPremium(c));
    const categoryOk = s.category === '' || (collection && categoriesFor(collection.id, s.level).includes(s.category));
    if (!collection || !categoryOk || !Array.isArray(s.history) || !s.history.length) return null;
    const allValid = s.history.every(h => {
      const w = h && WB.getById(h.id);
      return w && w.level === s.level && w.collection === s.collection &&
             (!s.category || w.category === s.category);
    });
    if (!allValid) return null;
    if (!Number.isInteger(s.historyIndex) || s.historyIndex < 0 || s.historyIndex >= s.history.length) return null;
    return s;
  } catch (e) {
    return null;
  }
}

// ── Draw a new prompt and push to history ─────
function showPrompt() {
  let w = WB.draw(getFilter(), getLevel(), currentCollection);
  if (!w) { renderEmpty(); return; } // no Waffles match the current filters

  // Never show the same Waffle twice in a row (can happen when the
  // shuffle-bag refills, or after restoring a saved place).
  const current = history[historyIndex];
  if (current && w.id === current.id) {
    w = WB.draw(getFilter(), getLevel(), currentCollection) || w;
  }

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
// Arriving from the Student page? Its "Teacher" tab links here with
// ?collection=…&level=…&category=… (the same parameters this page's own
// Student link writes). Only a Collection that is unlocked for this browser
// counts, so a premium Collection never bypasses the paywall: without Pro the
// parameters are ignored and the page opens as it normally would.
function readStudentContext() {
  const params = new URLSearchParams(location.search);
  const collection = COLLECTIONS.find(c => c.id === params.get('collection') && !c.locked && !isLockedPremium(c));
  const level = (params.get('level') || '').replace(' ', '+');   // a typed "B2+" arrives as "B2 "
  if (!collection || !LEVELS.includes(level)) return null;
  return { collection: collection.id, level, category: params.get('category') || '' };
}
const studentContext = readStudentContext();
// The parameters have been read; drop them so a later reload goes back to the
// teacher's own saved place instead of replaying them.
if (studentContext) window.history.replaceState(null, '', location.pathname);   // (`history` is the Waffle list here)

// Returning to a non-General Collection in this tab? Show its look now,
// while the Waffles load, so the page doesn't flash General English first.
// The full check of the saved place (below) then keeps or reverts it.
try {
  const early = studentContext
    ? COLLECTIONS.find(c => c.id === studentContext.collection)
    : COLLECTIONS.find(c =>
        c.id === JSON.parse(sessionStorage.getItem(STATE_KEY)).collection && !c.locked && !isLockedPremium(c));
  if (early) applyCollectionLook(early);
} catch (e) { /* no saved place — stay General */ }

WB.load()
  .then(() => {
    nextBtn.disabled = false;
    renderCollectionList();   // fills in the Waffle counts

    // From the Student page: open that Collection + level (+ category).
    // Otherwise, returning to this page in the same tab? Restore the teacher's place.
    const saved = studentContext ? null : loadTeacherState();
    if (studentContext) {
      currentLevel = studentContext.level;   // before selectCollection: the category menu is built for this level
      selectCollection(studentContext.collection, { resetDraw: false });
      const categoryOk = categoriesFor(currentCollection, currentLevel).includes(studentContext.category);
      categorySelect.value = categoryOk ? studentContext.category : '';
      categorySelect.classList.toggle('filtered', categoryOk);
      syncChipSelection();
      // The student had a Topic with no Waffles at this level (e.g. Kids ›
      // Gaming & Pixel Worlds at B2+): show All, and say so.
      if (studentContext.category && !categoryOk) {
        showSelectorNote('“' + studentContext.category + '” isn’t available at ' + (LEVEL_SHORT[currentLevel] ?? currentLevel) + ' — showing All.');
      }
    } else if (saved) {
      currentLevel = saved.level;   // before selectCollection: the category menu is built for this level
      selectCollection(saved.collection, { resetDraw: false });
      categorySelect.value = saved.category;
      categorySelect.classList.toggle('filtered', saved.category !== '');
      syncChipSelection();   // the select was set directly, so no change event fired
    } else {
      applyCollectionLook(COLLECTIONS.find(c => c.id === currentCollection));
      renderCategoryOptions(currentCollection);   // categories that exist at the saved level
    }

    levelSelect.value = currentLevel;
    syncLevelUI();
    localStorage.setItem('wb_level', currentLevel);
    updateLevelDisplay();
    WB.prime(getFilter(), getLevel(), currentCollection);

    if (saved) {
      history.push(...saved.history);
      historyIndex = saved.historyIndex;
      renderPrompt(history[historyIndex]);
    } else {
      showPrompt();
    }
  })
  .catch(err => {
    modeLabel.textContent      = 'Error';
    promptText.textContent     = 'Could not load prompts.';
    constraintText.textContent = err.message + ' — Check that data/waffles.json exists and the app is served over HTTP.';
    promptCard.setAttribute('data-mode', '');
    console.error('[WaffleBrain]', err);
  });

// Back from Stripe Checkout (?checkout=success&session_id=…): once the
// payment is confirmed, js/payment.js unlocks Pro; redraw the menu.
WaffleAccess.handleCheckoutReturn().then(unlocked => {
  if (unlocked) renderCollectionList();
});

// ── Keyboard focus after mouse use ────────────
// Space means "Next Waffle". After a control is used with the mouse,
// focus is released so the next Space press isn't swallowed by that
// control (e.g. copying again, or reopening a dropdown). Keyboard users
// (Tab/Enter/arrow keys) keep normal focus behaviour.
let lastInput = 'keyboard';
document.addEventListener('pointerdown', () => { lastInput = 'pointer'; }, true);
document.addEventListener('keydown',     () => { lastInput = 'keyboard'; }, true);

function releaseFocusAfterPointer(el) {
  if (lastInput === 'pointer') el.blur();
}

// A dropdown focused by the mouse should not grab Space either.
[levelSelect, categorySelect].forEach(sel => {
  sel.addEventListener('focus', () => {
    sel.dataset.pointerFocus = lastInput === 'pointer' ? '1' : '0';
  });
});

// ── Event listeners ───────────────────────────
nextBtn.addEventListener('click', () => { showPrompt(); releaseFocusAfterPointer(nextBtn); });
backBtn.addEventListener('click', () => { showPrev();   releaseFocusAfterPointer(backBtn); });

levelSelect.addEventListener('change', () => {
  currentLevel = levelSelect.value;
  localStorage.setItem('wb_level', currentLevel);
  updateLevelDisplay();
  // The new level may not have the selected category: rebuild the menu
  // (falls back to All Categories if so, and the teacher is told).
  const previousCategory = getFilter();
  renderCategoryOptions(currentCollection);
  if (previousCategory && getFilter() === '') {
    showSelectorNote('\u201C' + previousCategory + '\u201D isn\u2019t available at ' + (LEVEL_SHORT[currentLevel] ?? currentLevel) + ' \u2014 showing All.');
  }
  // Reset history when the level changes — back would cross levels —
  // and show a Waffle from the new level straight away.
  history.length = 0;
  historyIndex = -1;
  WB.prime(getFilter(), getLevel(), currentCollection);
  showPrompt();
  releaseFocusAfterPointer(levelSelect);
});

categorySelect.addEventListener('change', () => {
  const isFiltered = categorySelect.value !== '';
  categorySelect.classList.toggle('filtered', isFiltered);
  // Reset history when filter changes — back would cross category contexts
  history.length = 0;
  historyIndex = -1;
  WB.prime(getFilter(), getLevel(), currentCollection);
  showPrompt();
  releaseFocusAfterPointer(categorySelect);
});

// ── Level segmented control + Activity/Topic chips ──
// The visible controls are VIEWS of the native #level-select and
// #category-select, which stay in the page (hidden) as the single source of
// truth. Choosing something writes to the select and fires its normal
// `change` event, so filtering, restore and the Student link are unchanged.
// After any code sets a select's .value directly (restore, init) the matching
// sync function below must be called, because that fires no event.
const LEVEL_SHORT = { A1A2: 'A1/A2', B1: 'B1', 'B2+': 'B2+' };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function fireChange(select) {
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

// Level: three native radio buttons in a radiogroup (arrow keys work natively)
function renderLevelSeg() {
  levelSeg.innerHTML = '';
  LEVELS.forEach(value => {
    const label = document.createElement('label');
    label.className = 'seg-opt';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'level';
    input.value = value;
    input.className = 'seg-input';
    input.setAttribute('aria-label', levelLabels[value] ?? value);
    const text = document.createElement('span');
    text.className = 'seg-text';
    text.textContent = LEVEL_SHORT[value] ?? value;
    label.append(input, text);
    levelSeg.appendChild(label);
  });
  syncLevelUI();
}

function syncLevelUI() {
  levelSeg.querySelectorAll('input').forEach(r => { r.checked = r.value === levelSelect.value; });
}

levelSeg.addEventListener('change', (e) => {
  if (!e.target.matches('input')) return;
  levelSelect.value = e.target.value;
  fireChange(levelSelect);
  releaseFocusAfterPointer(e.target);
});

// Activity / Topic chips: one radio per option of #category-select
function renderActivityChips() {
  hideSelectorNote();
  const collection = COLLECTIONS.find(c => c.id === currentCollection);
  activityLabel.textContent = (collection && collection.categoryLabel) || 'Topic';

  chipScroll.innerHTML = '';
  [...categorySelect.options].forEach(opt => {
    const label = document.createElement('label');
    label.className = 'chip';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'activity';
    input.value = opt.value;
    input.className = 'chip-input';
    const text = document.createElement('span');
    text.className = 'chip-text';
    text.textContent = opt.value === '' ? 'All' : opt.textContent;
    label.append(input, text);
    chipScroll.appendChild(label);
  });
  syncChipSelection();
}

function syncChipSelection({ smooth = false } = {}) {
  chipScroll.querySelectorAll('input').forEach(r => { r.checked = r.value === categorySelect.value; });
  scrollActiveChipIntoView(smooth);
  updateChipFades();
}

// Bring the chosen chip into view, leaving a sliver of the previous chip and
// the start of the next one visible so it is clear the row scrolls. A chip
// that is already comfortably visible is left alone (nothing moves under
// the pointer).
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

chipScroll.addEventListener('change', (e) => {
  if (!e.target.matches('input')) return;
  categorySelect.value = e.target.value;
  fireChange(categorySelect);
  // Smooth for a tap/click; instant for the keyboard, so holding an arrow key
  // never queues up animated scrolls that lag behind the selection.
  scrollActiveChipIntoView(lastInput === 'pointer');
  releaseFocusAfterPointer(e.target);
});

// Re-clicking an already-chosen option fires no change; still release focus
// after a mouse/tap so Space keeps meaning "Next".
[levelSeg, chipScroll].forEach(group => {
  group.addEventListener('click', (e) => {
    if (e.target.matches('input')) releaseFocusAfterPointer(e.target);
  });
});

// A short-lived message under the chips (e.g. the category fallback). It
// overlays the top of the card instead of pushing the layout around.
let selectorNoteTimer = null;
function showSelectorNote(message) {
  selectorNote.textContent = message;
  selectorNote.classList.add('is-visible');
  clearTimeout(selectorNoteTimer);
  selectorNoteTimer = setTimeout(hideSelectorNote, 4500);
}
function hideSelectorNote() {
  clearTimeout(selectorNoteTimer);
  selectorNote.classList.remove('is-visible');
  selectorNote.textContent = '';
}

// Show the saved level at once (init re-syncs after the Waffles load).
levelSelect.value = currentLevel;
renderLevelSeg();

let copyResetTimer = null;

copyBtn.addEventListener('click', () => {
  // Copy the STUDENT wording of the current Waffle, looked up by its ID,
  // so the teacher can paste it straight into the lesson chat.
  const entry = history[historyIndex];
  const waffle = entry && WB.getById(entry.id);
  if (!waffle) return;
  const text = waffle.student.prompt;
  releaseFocusAfterPointer(copyBtn);

  const resetCopyBtn = () => {
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
      <path d="M8 4V2.8A.8.8 0 0 0 7.2 2H1.8A.8.8 0 0 0 1 2.8v5.4c0 .44.36.8.8.8H4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    </svg> Copy for student`;
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

// True for places where Space must type a space, never trigger Next.
function isTypingTarget(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName === 'INPUT') {
    return !['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color', 'file'].includes(el.type);
  }
  return false;
}

document.addEventListener('keydown', (e) => {
  if (paywall.open) return;   // the paywall handles its own keys (Escape closes it)
  if (e.code === 'Space' && !isTypingTarget(e.target)) {
    const t = e.target;
    const pointerFocusedSelect = t.tagName === 'SELECT' && t.dataset.pointerFocus === '1';
    if (t === document.body || pointerFocusedSelect) {
      e.preventDefault();
      if (pointerFocusedSelect) t.blur();
      if (!nextBtn.disabled) showPrompt();
    }
  }
  if (e.key === 'Escape') {
    closeWaffleList();
  }
});
// ── Offline support ───────────────────────────
// Registers sw.js, which saves WaffleBrain (pages + all Waffles) so it keeps
// working if the connection drops. Silently skipped where unsupported.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('[WaffleBrain] Offline support unavailable:', err));
  });
}
