# WaffleBrain — notes for Claude Code

WaffleBrain is an ESL speaking-activity app for online teachers. Plain HTML/CSS/JS,
no build step, hosted on GitHub Pages at wafflebrain.com (`CNAME`). Pushing to
`main` on GitHub publishes the live site — never push unless the owner asks.

The owner is not a programmer. Explain changes in plain language, keep changes
narrow, and do not make unrelated "improvements".

## Terminology (use exactly these)

| Term | Meaning |
|---|---|
| **WaffleBrain** | The product |
| **Waffle** | ONE individual speaking activity (e.g. Waffle 27) |
| **Collection** | A group of Waffles: General English, IELTS, Kids, … |
| **Teacher Waffle** | The teacher presentation of a Waffle (`teacher` field) |
| **Student Waffle** | The student presentation of the same Waffle (`student` field) |

Never use "Waffle" to mean a Collection. Legacy DOM ids/CSS classes in
`index.html` / `style.css` (`waffle-select`, `waffle-list`, `waffle-trigger`, …)
refer to the **Collection** dropdown; they have not been renamed yet.

## Waffle content rules — read first: `docs/waffle-content-rules.md`

**"A Waffle should start a conversation, not conduct a conversation."**

- `docs/waffle-content-rules.md` is the canonical Waffle content specification.
  Read it before creating, editing, reviewing or generating any Waffle.
- It applies to General English, Kids, Business and every future Collection.
- New Waffles have exactly four content elements: a short Teacher Prompt, a
  short Language Focus, a short Student Prompt and 2–4 short Conversation
  Starters. No Student Goal, no section labels, no steps, rules or scripts.
- It overrides older content guidance where they conflict. Superseded where
  they conflict: `design/` (incl. `prompt_philosophy.md`, `PROJECT_STATE.md`,
  `level_design.md`, `prompt_plan.md`), `wafflebrain-kids/*.md` (engines,
  Hook/Ask/Teacher/Quick/Stuck), `WaffleBrain Prompt Rewrite/`, and
  `data/waffle_system_spec.md`. Keep those files; do not rewrite them.
- Do not retrofit existing Waffles to the rules unless a task explicitly asks.
- `node scripts/validate.js` prints content warnings (word counts, section
  labels, lists, activity mechanics, missing Starters). Warnings do not fail
  the run; review them for any Waffle you add or change.

## Canonical Waffle data: `data/waffles.json`

`data/waffles.json` is the ONLY canonical source of Waffle content. It is an
array with one record per Waffle:

```json
{
  "id": 27,
  "collection": "general",
  "level": "A1A2",
  "category": "Describe",
  "teacher": { "prompt": "…", "constraint": "…" },
  "student": { "prompt": "…", "constraint": "…" }
}
```

- `level` is one of `A1A2`, `B1`, `B2+` (must match the `<option>` values in
  `index.html` and `LEVELS` in `app.js`).
- `constraint` is shown in the Teacher app as "Language Focus". At migration it
  was identical on both sides; the two sides may diverge later.
- `student.starters` (2–4 short sentence stems) is required for every NEW
  Waffle (see `docs/waffle-content-rules.md`). Existing General English
  records have none; do not add Starters to them unless a task asks.
- `student.goal` is legacy: existing Business (521–550, 611–636) and Kids
  records have one and the Student page shows it. Do not remove it, and do
  not give new Waffles a Goal.
- Kids records (551–610, `collection: "kids"`) use their own categories
  (Weird Creatures, Gaming, Mysteries, Future Tech, Weird & Gross, Stories)
  and have `student.goal` + `student.starters`. Their `teacher.prompt`
  currently holds the scene plus `Ask:` / `Teacher:` / `Quick:` / `Stuck:`
  sections — a legacy format that does NOT follow the content rules and is due
  for a separate rewrite; do not copy it for new Waffles. The Teacher category
  dropdown follows the selected Collection's categories.

### Permanent IDs — rules

- The original 520 Waffles were assigned IDs **1–520** once (2026-09-26).
- An ID is the permanent identity of a Waffle. **Never renumber, reuse or
  delete an ID**, even if the wording, category or level changes.
- New Waffles get the next unused number (currently 637+), in any Collection.
- Teacher and Student content always live in the **same** record. Never store
  them in separate files or link them by position.

### Validate before every commit that touches Waffle data

```
node scripts/validate.js                   # core checks + content-warning summary
node scripts/validate.js --warnings        # also list every content warning
node scripts/validate.js --check-sources   # also compare against the legacy
                                           # files (fails once wording is edited;
                                           # only meaningful for the migration)
```

`scripts/migrate-waffles.js` was a one-off that built `waffles.json`. It refuses
to run if `waffles.json` exists. Do not re-run or "regenerate" the data.

## Archive / historical files — do NOT edit as alternate sources

These are kept for history only (clean-up is planned for a later phase; do not
delete, move or rename them without the owner's instruction):

- `data/prompts.json` — legacy Teacher prompts (source of `teacher` side)
- `data/prompts_original.json` — legacy Student prompts (source of `student` side)
- everything in `WaffleBrain Prompt Rewrite/`
- `design/*.md` prompt drafts
- backup copies outside this repo (`../waffle brainLAST.WORKING.SITE01`, zips)

## App structure

- `index.html` + `app.js` + `engine.js` — Teacher app. `engine.js` (global `WB`)
  loads `data/waffles.json`, filters by collection + level + category, and draws
  with a shuffle-bag. `WB.getById(id)` looks up a Waffle. Teacher history stores
  Waffle IDs.
- `student.html` + `student.js` + `studentSupport.js` — Student app. By
  default shows 30 separate standalone student activities hard-coded in
  `studentSupport.js`. With `?collection=business&level=…` (the Teacher
  page's "Student" link adds this) it instead shows that Collection's
  Student Waffles from `waffles.json`.
- Both pages show the current Collection name in the header and set
  `body[data-collection]`; `style.css` uses it for the Business English look.
- `wafflebrain-kids/` — separate copy of the app with its own data. Live at
  `/wafflebrain-kids/`. Do not modify unless asked.

## Testing locally

`fetch()` needs HTTP, so serve the folder:
`python -m http.server 8765` then open http://127.0.0.1:8765/index.html
