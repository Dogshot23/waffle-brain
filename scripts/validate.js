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
//    node scripts/validate.js --warnings         (list every content warning)
//
//  Exits with code 1 if any check fails. Content warnings (from
//  docs/waffle-content-rules.md) are printed as a summary and never fail.
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

// Allowed `collection` values: the shared list in collections.js (the same
// one the Teacher and Student pages use).
const COLLECTIONS = require(path.join(ROOT, 'collections.js')).map(c => c.id);
const LEVELS      = ['A1A2', 'B1', 'B2+'];

// Waffles with an id above this are "new" and must follow the full content
// model in docs/waffle-content-rules.md (Student Goal + 2–4 Starters are
// required). Records up to this id pre-date the rules and are not failed.
const CONTENT_BASELINE_MAX_ID = 636;

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

  // Student Goal + Starters (shown on the Student page). If present: Goal
  // non-empty, Starters 2–4 non-empty strings. NEW Waffles (id above
  // CONTENT_BASELINE_MAX_ID) must have both. See docs/waffle-content-rules.md.
  const s = w.student;
  const isNewWaffle = Number.isInteger(w.id) && w.id > CONTENT_BASELINE_MAX_ID;
  if (s && (s.starters !== undefined || isNewWaffle)) {
    if (!Array.isArray(s.starters) || s.starters.length < 2 || s.starters.length > 4 || !s.starters.every(nonEmpty))
      err(`${at}: student.starters must be 2–4 non-empty strings${isNewWaffle ? ' (required for new Waffles)' : ''}`);
  }
  if (s && (s.goal !== undefined || isNewWaffle) && !nonEmpty(s.goal))
    err(`${at}: student.goal is ${s.goal === undefined ? 'missing (required for new Waffles)' : 'empty'}`);
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

// ── Content warnings (never fail the run) ─────
// Checks against docs/waffle-content-rules.md: "A Waffle should start a
// conversation, not conduct one" and "Every Student Waffle should clearly
// initiate a conversation between the student and the teacher."
// Word limits and wording checks are guidance, not gates.
// Every record is counted in the per-collection summary; warnings for NEW
// Waffles (id above CONTENT_BASELINE_MAX_ID) are always listed in full.
// Use --warnings to list every warning, including existing content.
const LIMITS = { teacherPrompt: 30, languageFocus: 12, studentPrompt: 25, goal: 12, starter: 6 };
const words = (t) => (typeof t === 'string' ? t.split(/\s+/).filter(Boolean).length : 0);
const SECTION_LABEL = /^\s*(Ask|Teacher|Quick|Stuck|Hook|Task|Extension|Rules?|Step \d+|Round \d+)\s*:/im;
const LIST_LINE     = /(^|\n)\s*(\d+[.)]|[-•*])\s+\S/;
const MECHANICS     = /\b(rules of the game|game rules|rounds?|points|score|scoring|stages?|grid|scavenger hunt|worksheet|bingo|timer|winner|take turns|step \d)\b/i;
// Student side: the student should be talking WITH the teacher.
const WITH_TEACHER  = /\bteacher\b/i;
const TALK_OPENER   = /^(Ask|Tell|Describe|Explain|Talk|Share|Show)\b/i;
// A conversation Goal points at the teacher or a shared discovery.
const GOAL_CONVERSATIONAL = /\b(teacher|you both|each other|together)\b|^(Find out|See |Compare|Discover|Learn|Ask|Hear)/i;
// Worksheet-style Starters: a blank in the middle of a sentence, or known frames.
const STARTER_WORKSHEET = /(\.\.\.|…|_{2,})\s*,?\s*[A-Za-z]|^I think\b.*\bbecause\b|^I'd choose\b|^It could be because\b|^The most important (thing|rule|reason)\b/i;

const CHECKS = {
  'teacher-prompt-long':  'Teacher Prompt over ' + LIMITS.teacherPrompt + ' words',
  'language-focus-long':  'Language Focus over ' + LIMITS.languageFocus + ' words',
  'student-prompt-long':  'Student Prompt over ' + LIMITS.studentPrompt + ' words',
  'starter-long':         'a Starter over ' + LIMITS.starter + ' words',
  'section-labels':       'Teacher Prompt has section labels (Ask:/Teacher:/Quick:/Stuck:…)',
  'list-steps':           'numbered or bulleted steps in a prompt',
  'activity-mechanics':   'activity-mechanics language (rules, rounds, points, score…)',
  'student-not-with-teacher': 'Student Prompt not directed at the teacher (standalone question?)',
  'goal-long':            'Student Goal over ' + LIMITS.goal + ' words',
  'goal-activity-style':  'Student Goal looks like an activity objective, not about the teacher',
  'goal-repeats-prompt':  'Student Goal repeats the Student Prompt',
  'starters-no-invite':   'no Starter invites the teacher in (no question)',
  'starter-worksheet':    'worksheet-style Starter (sentence-completion frame)',
};

const warnings = [];
const summary = {}; // collection → check → count
waffles.forEach(w => {
  if (!w || !w.teacher || !w.student) return;
  const isNew = Number.isInteger(w.id) && w.id > CONTENT_BASELINE_MAX_ID;
  const hits = [];
  const hit = (check, detail) => hits.push({ check, detail });

  const tp = w.teacher.prompt, lf = w.teacher.constraint, sp = w.student.prompt;
  if (words(tp) > LIMITS.teacherPrompt) hit('teacher-prompt-long', `${words(tp)} words`);
  if (words(lf) > LIMITS.languageFocus) hit('language-focus-long', `${words(lf)} words`);
  if (words(sp) > LIMITS.studentPrompt) hit('student-prompt-long', `${words(sp)} words`);
  const longStarters = (Array.isArray(w.student.starters) ? w.student.starters : []).filter(st => words(st) > LIMITS.starter);
  if (longStarters.length) hit('starter-long', longStarters.map(st => `"${st}"`).join(', '));
  const label = typeof tp === 'string' && tp.match(SECTION_LABEL);
  if (label) hit('section-labels', `"${label[0].trim()}"`);
  const list = [tp, sp].find(t => typeof t === 'string' && LIST_LINE.test(t));
  if (list) hit('list-steps', `"${list.split('\n').find(l => LIST_LINE.test(l)).trim().slice(0, 50)}"`);
  const mech = [tp, sp].map(t => typeof t === 'string' && t.match(MECHANICS)).find(Boolean);
  if (mech) hit('activity-mechanics', `"${mech[0]}"`);
  if (typeof sp === 'string' && !WITH_TEACHER.test(sp) && !TALK_OPENER.test(sp.trim()))
    hit('student-not-with-teacher', `"${sp.slice(0, 50)}${sp.length > 50 ? '…' : ''}"`);
  const goal = w.student.goal;
  if (typeof goal === 'string' && goal.trim()) {
    if (words(goal) > LIMITS.goal) hit('goal-long', `${words(goal)} words`);
    if (!GOAL_CONVERSATIONAL.test(goal.trim())) hit('goal-activity-style', `"${goal}"`);
    const norm = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (typeof sp === 'string' && norm(sp).includes(norm(goal))) hit('goal-repeats-prompt', `"${goal}"`);
  }
  const starters = Array.isArray(w.student.starters) ? w.student.starters : [];
  if (starters.length && !starters.some(st => typeof st === 'string' && st.includes('?'))) hit('starters-no-invite', '');
  const worksheet = starters.filter(st => typeof st === 'string' && STARTER_WORKSHEET.test(st));
  if (worksheet.length) hit('starter-worksheet', worksheet.map(st => `"${st}"`).join(', '));

  const col = w.collection || '(none)';
  summary[col] = summary[col] || { waffles: 0, flagged: 0 };
  summary[col].waffles++;
  if (hits.length) summary[col].flagged++;
  hits.forEach(h => {
    summary[col][h.check] = (summary[col][h.check] || 0) + 1;
    warnings.push({ id: w.id, collection: col, isNew, ...h });
  });
});

// ── Report ────────────────────────────────────
const count = (key) => waffles.reduce((m, w) => (m[w[key]] = (m[w[key]] || 0) + 1, m), {});
console.log(`Waffles in data/waffles.json: ${waffles.length}`);
console.log(`Unique IDs: ${seenIds.size}  (range ${Math.min(...seenIds.keys())}–${Math.max(...seenIds.keys())})`);
console.log('By collection:', count('collection'));
console.log('By level:     ', count('level'));
console.log('By category:  ', count('category'));
if (sourceSummary) console.log(`Legacy source pairs: ${sourceSummary.sourcePairs}, matched exactly: ${sourceSummary.matched}`);

console.log('\nContent warnings (docs/waffle-content-rules.md — guidance only, never a failure):');
const cols = Object.keys(summary);
const pad = (v, n) => String(v).padStart(n);
console.log('  ' + 'check'.padEnd(66) + cols.map(c => pad(c, 10)).join(''));
console.log('  ' + 'Waffles'.padEnd(66) + cols.map(c => pad(summary[c].waffles, 10)).join(''));
console.log('  ' + 'Waffles with at least one warning'.padEnd(66) + cols.map(c => pad(summary[c].flagged, 10)).join(''));
Object.entries(CHECKS).forEach(([key, label]) => {
  if (!cols.some(c => summary[c][key])) return;
  console.log('  ' + ('- ' + label).padEnd(66) + cols.map(c => pad(summary[c][key] || 0, 10)).join(''));
});
const newWarnings = warnings.filter(x => x.isNew);
const listed = process.argv.includes('--warnings') ? warnings : newWarnings;
const newCount = waffles.filter(w => w && Number.isInteger(w.id) && w.id > CONTENT_BASELINE_MAX_ID).length;
console.log(`  New Waffles (id > ${CONTENT_BASELINE_MAX_ID}): ${newCount}, with warnings: ${new Set(newWarnings.map(x => x.id)).size}`);
if (listed.length) {
  console.log(process.argv.includes('--warnings') ? '\n  All content warnings:' : '\n  Content warnings on NEW Waffles — please review:');
  listed.forEach(x => console.log(`  ⚠ id ${x.id} (${x.collection}): ${CHECKS[x.check]}${x.detail ? ' — ' + x.detail : ''}`));
} else if (!process.argv.includes('--warnings')) {
  console.log('  (Run with --warnings to list every warning on existing content.)');
}

if (errors.length) {
  console.error(`\n✗ VALIDATION FAILED — ${errors.length} problem(s):`);
  errors.slice(0, 50).forEach(e => console.error('  - ' + e));
  if (errors.length > 50) console.error(`  …and ${errors.length - 50} more`);
  process.exit(1);
}
console.log('\n✓ All checks passed.');
