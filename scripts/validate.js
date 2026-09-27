#!/usr/bin/env node
// ─────────────────────────────────────────────
//  WaffleBrain — scripts/validate.js
//  Checks data/waffles.json (the canonical Waffle data).
//  Run before every commit that touches Waffle data:
//
//    node scripts/validate.js
//    node scripts/validate.js --check-sources   (also compare against the
//                                                 legacy files the 520 were
//                                                 migrated from)
//
//  Exits with code 1 if any check fails.
// ─────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const ROOT          = path.join(__dirname, '..');
const WAFFLES_FILE  = path.join(ROOT, 'data', 'waffles.json');
const TEACHER_FILE  = path.join(ROOT, 'data', 'prompts.json');
const STUDENT_FILE  = path.join(ROOT, 'data', 'prompts_original.json');

// The original migration assigned IDs 1–520. These IDs are permanent:
// every one of them must always exist (never deleted, renumbered or reused).
const MIGRATED_ID_MAX = 520;

const COLLECTIONS = ['general', 'business'];
const LEVELS      = ['A1A2', 'B1', 'B2+'];

const errors = [];
const err = (msg) => errors.push(msg);
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';

// ── Load ──────────────────────────────────────
let waffles;
try {
  waffles = JSON.parse(fs.readFileSync(WAFFLES_FILE, 'utf8'));
} catch (e) {
  console.error(`✗ Could not read/parse data/waffles.json: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(waffles)) {
  console.error('✗ data/waffles.json must be a JSON array of Waffle records.');
  process.exit(1);
}

// ── Per-record checks ─────────────────────────
const seenIds = new Map();
waffles.forEach((w, i) => {
  const at = `record #${i + 1}` + (w && w.id !== undefined ? ` (id ${w.id})` : '');
  if (!w || typeof w !== 'object') { err(`${at}: not an object`); return; }

  if (w.id === undefined || w.id === null)       err(`${at}: missing id`);
  else if (!Number.isInteger(w.id) || w.id < 1)  err(`${at}: id must be a positive whole number`);
  else if (seenIds.has(w.id))                    err(`${at}: duplicate id ${w.id} (also record #${seenIds.get(w.id)})`);
  else seenIds.set(w.id, i + 1);

  if (!nonEmpty(w.collection))                  err(`${at}: missing collection`);
  else if (!COLLECTIONS.includes(w.collection)) err(`${at}: unknown collection "${w.collection}"`);
  if (!nonEmpty(w.level))                       err(`${at}: missing level`);
  else if (!LEVELS.includes(w.level))           err(`${at}: unknown level "${w.level}"`);
  if (!nonEmpty(w.category))                    err(`${at}: missing category`);

  for (const side of ['teacher', 'student']) {
    const p = w[side];
    if (!p || typeof p !== 'object')   err(`${at}: missing ${side} presentation`);
    else if (!nonEmpty(p.prompt))      err(`${at}: ${side}.prompt is missing or empty`);
  }
  if (w.teacher && !nonEmpty(w.teacher.constraint)) err(`${at}: teacher.constraint is missing or empty`);
});

// ── Permanent migrated IDs 1–520 all present ──
const missing = [];
for (let id = 1; id <= MIGRATED_ID_MAX; id++) if (!seenIds.has(id)) missing.push(id);
if (missing.length) err(`Permanent IDs missing: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '…' : ''} (${missing.length} total)`);

// ── No duplicated activity (same prompt text in two records) ─
for (const side of ['teacher', 'student']) {
  const seen = new Map();
  waffles.forEach(w => {
    const text = w && w[side] && w[side].prompt;
    if (!nonEmpty(text)) return;
    if (seen.has(text)) err(`Duplicate ${side} prompt in ids ${seen.get(text)} and ${w.id}`);
    else seen.set(text, w.id);
  });
}

// ── Optional: compare with legacy migration sources ─
let sourceSummary = null;
if (process.argv.includes('--check-sources')) {
  const teacher = JSON.parse(fs.readFileSync(TEACHER_FILE, 'utf8'));
  const student = JSON.parse(fs.readFileSync(STUDENT_FILE, 'utf8'));
  const byId = new Map(waffles.map(w => [w.id, w]));
  let id = 0, matched = 0;
  for (const level of Object.keys(teacher)) {
    for (const cat of Object.keys(teacher[level])) {
      teacher[level][cat].forEach((tp, i) => {
        id++;
        const sp = student[level] && student[level][cat] && student[level][cat][i];
        const w  = byId.get(id);
        const at = `source ${level} / ${cat} / #${i + 1} → id ${id}`;
        if (!w)  { err(`${at}: no Waffle with this id`); return; }
        if (!sp) { err(`${at}: no matching student source entry`); return; }
        if (!w.teacher || !w.student) return; // already reported above
        let ok = true;
        if (w.level !== level)                      { ok = false; err(`${at}: level is "${w.level}"`); }
        if (w.category !== cat)                     { ok = false; err(`${at}: category is "${w.category}"`); }
        if (w.teacher.prompt !== tp.prompt)         { ok = false; err(`${at}: teacher.prompt differs from source`); }
        if (w.teacher.constraint !== tp.constraint) { ok = false; err(`${at}: teacher.constraint differs from source`); }
        if (w.student.prompt !== sp.prompt)         { ok = false; err(`${at}: student.prompt differs from source`); }
        if (w.student.constraint !== sp.constraint) { ok = false; err(`${at}: student.constraint differs from source`); }
        if (ok) matched++;
      });
    }
  }
  sourceSummary = { sourcePairs: id, matched };
  if (id !== MIGRATED_ID_MAX) err(`Legacy sources contain ${id} activities, expected ${MIGRATED_ID_MAX}`);
}

// ── Report ────────────────────────────────────
const count = (key) => waffles.reduce((m, w) => (m[w[key]] = (m[w[key]] || 0) + 1, m), {});
console.log(`Waffles in data/waffles.json: ${waffles.length}`);
console.log(`Unique IDs: ${seenIds.size}  (range ${Math.min(...seenIds.keys())}–${Math.max(...seenIds.keys())})`);
console.log('By collection:', count('collection'));
console.log('By level:     ', count('level'));
console.log('By category:  ', count('category'));
if (sourceSummary) console.log(`Legacy source pairs: ${sourceSummary.sourcePairs}, matched exactly: ${sourceSummary.matched}`);

if (errors.length) {
  console.error(`\n✗ VALIDATION FAILED — ${errors.length} problem(s):`);
  errors.slice(0, 50).forEach(e => console.error('  - ' + e));
  if (errors.length > 50) console.error(`  …and ${errors.length - 50} more`);
  process.exit(1);
}
console.log('\n✓ All checks passed.');
