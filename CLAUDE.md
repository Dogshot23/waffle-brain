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
**"Every Student Waffle should clearly initiate a conversation between the
student and the teacher."**

- `docs/waffle-content-rules.md` is the canonical Waffle content specification.
  Read it before creating, editing, reviewing or generating any Waffle.
- It applies to General English, Kids, Business and every future Collection,
  at every level and on every theme.
- New Waffles have exactly five content elements: a short Teacher Prompt, a
  short Language Focus, a Student Prompt, a Student Goal and 2–4 Conversation
  Starters. No section labels, no steps, rules or scripts.
- The Teacher side creates the interesting situation; the Student side turns
  it into a student → teacher conversation. The model for the Student side is
  the 30 standalone Student Waffles in `studentSupport.js` ("Ask your teacher
  about the best meal they've ever eaten" · Goal "Find out what made it so
  memorable" · Starters "Where was it?" / "What made it so good?" / "Would you
  go back?"):
  - Student Prompt: invites the student to talk WITH the teacher (Ask/Tell/
    Describe to/Talk to your teacher…, or another natural form) — not a
    standalone question, exercise or roleplay.
  - Student Goal: a CONVERSATION goal — what to find out about the teacher's
    experience, opinion or perspective (about 5–12 words). Not an activity
    objective. (This replaces the earlier "no Student Goal" rule.)
  - Starters: natural things to say aloud; at least one normally invites the
    teacher in (e.g. "What about you?"). No sentence-completion frames.
- It overrides older content guidance where they conflict. Superseded where
  they conflict: `design/` (incl. `prompt_philosophy.md`, `PROJECT_STATE.md`,
  `level_design.md`, `prompt_plan.md`), `wafflebrain-kids/*.md` (engines,
  Hook/Ask/Teacher/Quick/Stuck), `WaffleBrain Prompt Rewrite/`, and
  `data/waffle_system_spec.md`. Keep those files; do not rewrite them.
- Do not retrofit existing Waffles to the rules unless a task explicitly asks.
- `node scripts/validate.js` FAILS if a new Waffle (id 637+) has no Student
  Goal or not 2–4 Starters, and prints content warnings (word counts, section
  labels, lists, activity mechanics, Student Prompts not directed at the
  teacher, activity-style Goals, Starters that never invite the teacher in,
  worksheet-style Starters). Warnings do not fail the run; review them for any
  Waffle you add or change.

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
- `student.goal` (a conversation goal) and `student.starters` (2–4) are
  required for every NEW Waffle (see `docs/waffle-content-rules.md`); the
  Student page shows both. Existing General English records have neither; do
  not add them unless a task asks. Existing Business Goals (521–550, 611–636)
  pre-date the conversation-goal rule; leave them unless a task asks.
- Kids records (`collection: "kids"`: 551–610 and 878–895, 78 in all) use
  their own categories: Opinions & Ideas · Growing Up · Friends & People ·
  Online Life · Games & Entertainment · School. All of them follow the full
  five-element model: 551–610 were rewritten as student → teacher
  conversations with a Goal and Starters (2026-09-29/30), and 878–895 were
  written that way. They are fine to use as models for new Kids Waffles.
  The Teacher category dropdown follows the selected Collection's categories.
- IELTS (662–697), Cambridge (698–733), Travel (734–769), Debate (770–805),
  Medical (806–841) and Conversation Club (842–877) were written to the full
  five-element model. Each of these Collections has its own categories:
  - IELTS: Part 1: Interview · Part 2: Long Turn · Part 3: Discussion
  - Cambridge (A1A2 = A2 Key, B1 = B1 Preliminary, B2+ = B2 First / C1
    Advanced): Interview · Long Turn · Collaborative Task · Discussion
  - Travel: Getting Around · Places to Stay · Eating Out · Travel Problems
  - Debate: Society · Technology · Education & Work · Environment
  - Medical (for healthcare workers): Patient Consultations · Explaining &
    Advising · Working in Healthcare · Health Issues
  - Conversation Club: Life Stories · Big Questions · Culture & Media · What If

### Permanent IDs — rules

- The original 520 Waffles were assigned IDs **1–520** once (2026-09-26).
- An ID is the permanent identity of a Waffle. **Never renumber, reuse or
  delete an ID**, even if the wording, category or level changes.
- New Waffles get the next unused number (currently 896+), in any Collection.
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

- `collections.js` — the ONE list of Collections (id, display name, locked).
  `app.js` (Collection menu), `student.js` (Student page header) and
  `scripts/validate.js` (allowed `collection` values) all read it. To add a
  Collection, add it here — nowhere else.
- `index.html` + `app.js` + `engine.js` — Teacher app. `engine.js` (global `WB`)
  loads `data/waffles.json`, filters by collection + level + category, and draws
  with a shuffle-bag. `WB.getById(id)` looks up a Waffle. Teacher history stores
  Waffle IDs.
- `student.html` + `student.js` + `studentSupport.js` — Student app. By
  default shows 30 separate standalone student activities hard-coded in
  `studentSupport.js`. With `?collection=business&level=…` (the Teacher
  page's "Student" link adds this, plus `&category=…` when a category is
  selected) it instead shows that Collection's Student Waffles from
  `waffles.json` at that level (and in that category).
- Both pages show the current Collection name in the header and set
  `body[data-collection]`; `style.css` uses it for the Business English and
  Kids looks (other Collections use the default look).
- `wafflebrain-kids/` — separate copy of the app with its own data. Live at
  `/wafflebrain-kids/`. Do not modify unless asked.

## Testing locally

`fetch()` needs HTTP, so serve the folder:
`python -m http.server 8765` then open http://127.0.0.1:8765/index.html
