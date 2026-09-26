#!/usr/bin/env node
// ─────────────────────────────────────────────
//  WaffleBrain — scripts/migrate-waffles.js
//  ONE-OFF migration. Builds data/waffles.json from the two
//  legacy, position-aligned source files:
//
//    data/prompts.json           → Teacher Waffles (teacher cue cards)
//    data/prompts_original.json  → Student Waffles (original student wording)
//
//  Both files are { level: { category: [ {prompt, constraint}, ... ] } }
//  and contain the same 520 activities in the same order. Each pair
//  becomes ONE Waffle record with a permanent numeric ID (1–520),
//  assigned in document order of data/prompts.json.
//
//  Prompt and constraint wording is copied exactly — nothing is
//  rewritten, and no titles, goals or starters are invented.
//
//  SAFETY: refuses to run if data/waffles.json already exists.
//  IDs are permanent; re-running this against edited source files
//  could assign different IDs. Once waffles.json exists, edit it
//  directly — never regenerate it.
//
//  Usage:  node scripts/migrate-waffles.js
// ─────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const TEACHER_FILE = path.join(ROOT, 'data', 'prompts.json');
const STUDENT_FILE = path.join(ROOT, 'data', 'prompts_original.json');
const OUTPUT_FILE  = path.join(ROOT, 'data', 'waffles.json');

const COLLECTION      = 'general';   // General English — the only existing Collection
const EXPECTED_COUNT  = 520;

function fail(msg) {
  console.error(`\n✗ MIGRATION ABORTED: ${msg}\nNo file was written.`);
  process.exit(1);
}

if (fs.existsSync(OUTPUT_FILE)) {
  fail(`${path.relative(ROOT, OUTPUT_FILE)} already exists. Waffle IDs are permanent — do not regenerate.`);
}

const teacher = JSON.parse(fs.readFileSync(TEACHER_FILE, 'utf8'));
const student = JSON.parse(fs.readFileSync(STUDENT_FILE, 'utf8'));

// ── 1. Verify the two sources align exactly ───
const tLevels = Object.keys(teacher);
const sLevels = Object.keys(student);
if (tLevels.join('|') !== sLevels.join('|')) {
  fail(`Level keys differ: teacher [${tLevels}] vs student [${sLevels}]`);
}

for (const level of tLevels) {
  const tCats = Object.keys(teacher[level]);
  const sCats = Object.keys(student[level]);
  if (tCats.join('|') !== sCats.join('|')) {
    fail(`Category keys differ in ${level}: [${tCats}] vs [${sCats}]`);
  }
  for (const cat of tCats) {
    const t = teacher[level][cat];
    const s = student[level][cat];
    if (!Array.isArray(t) || !Array.isArray(s) || t.length !== s.length) {
      fail(`Count mismatch in ${level} / ${cat}: teacher ${t && t.length}, student ${s && s.length}`);
    }
    t.forEach((tp, i) => {
      const sp = s[i];
      const where = `${level} / ${cat} / #${i + 1}`;
      if (typeof tp.prompt !== 'string' || !tp.prompt.trim()) fail(`Missing teacher prompt at ${where}`);
      if (typeof sp.prompt !== 'string' || !sp.prompt.trim()) fail(`Missing student prompt at ${where}`);
      if (tp.constraint !== sp.constraint) fail(`Constraint differs at ${where} — pairs may be misaligned`);
      const extra = [...Object.keys(tp), ...Object.keys(sp)].filter(k => k !== 'prompt' && k !== 'constraint');
      if (extra.length) fail(`Unexpected field(s) [${extra}] at ${where} — would be lost`);
    });
  }
}
console.log('✓ Source files align: same levels, categories, counts, order and constraints.');

// ── 2. Build unified records, IDs in document order ─
const waffles = [];
let nextId = 1;
for (const level of tLevels) {
  for (const cat of Object.keys(teacher[level])) {
    teacher[level][cat].forEach((tp, i) => {
      const sp = student[level][cat][i];
      waffles.push({
        id:         nextId++,
        collection: COLLECTION,
        level:      level,
        category:   cat,
        teacher:    { prompt: tp.prompt, constraint: tp.constraint },
        student:    { prompt: sp.prompt, constraint: sp.constraint },
      });
    });
  }
}

if (waffles.length !== EXPECTED_COUNT) {
  fail(`Expected ${EXPECTED_COUNT} Waffles, built ${waffles.length}`);
}

// ── 3. Write (one record per line block, stable 2-space JSON) ─
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(waffles, null, 2) + '\n', 'utf8');
console.log(`✓ Wrote ${waffles.length} Waffles (IDs 1–${waffles.length}) to ${path.relative(ROOT, OUTPUT_FILE)}`);
console.log('Next: run  node scripts/validate.js --check-sources');
