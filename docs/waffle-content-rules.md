# WaffleBrain Waffle Content Rules

**This is the canonical specification for WaffleBrain content.** It applies to
every Waffle in every Collection — General English, Kids, Business, and every
future Collection. Where older guidance disagrees (see the end of this file),
this document wins.

---

## The principle

> **A Waffle should start a conversation, not conduct a conversation.**

A **Waffle** is one conversation starter. The conversation that follows *is*
the activity. The Waffle's only job is to get a teacher and student talking
naturally about something interesting, and to give that talk somewhere to go.

The model is the simplicity and immediacy of the General English Waffles:
one clear situation or angle, one short prompt, and the teacher is off.

---

## The two tests

Every Waffle must pass both:

1. **The two-second test** — Could a teacher glance at this for two seconds
   and immediately start a natural conversation?
2. **The starter test** — Does this *start* a conversation, or does it
   *conduct* an activity?

If a Waffle needs several instructions, stages, explanations or teacher
decisions before the talking can begin, it has drifted from a Waffle into an
activity. Simplify it.

---

## The four content elements

Every new Waffle has exactly these four content elements, and nothing else:

| Side | Element | Data field | What it is |
|---|---|---|---|
| Teacher | **Teacher Prompt** | `teacher.prompt` | One short conversational prompt the teacher can use straight away. |
| Teacher | **Language Focus** | `teacher.constraint` | One short sentence naming the language or conversational behaviour to encourage. |
| Student | **Student Prompt** | `student.prompt` | One short, natural invitation to speak. |
| Student | **Conversation Starters** | `student.starters` | 2–4 short phrases that help the student begin talking. |

The record also carries its permanent `id`, `collection`, `level` and
`category` (see `CLAUDE.md` for the data rules). For compatibility, new
Waffles also set `student.constraint` to the same text as
`teacher.constraint`; the Student page does not show it.

### Teacher Prompt
- One prompt, normally one sentence. Plain text on one line.
- Says what to talk about and gives it an angle. It is not a script.
- No section labels (`Ask:`, `Teacher:`, `Quick:`, `Stuck:`, `Step 1:` …),
  no lists, no stages, no "if the student says X, do Y".
- Good follow-up should come naturally from the topic; the teacher does not
  need it written out.

### Language Focus
- One short sentence naming a language function, with example forms where
  useful: *Giving opinions ('I think', 'I don't think').*
- It is guidance for the teacher, not a success criterion, quota or rule.
  Prefer *"Describing a room ('There is/are')"* over
  *"Student names at least 3 items"*.

### Student Prompt
- One short, natural invitation to speak, written to the student.
- Enough for the student to know what to talk about — no more.
- It should feel like being asked about something interesting, not like
  being given a task or a test.

### Conversation Starters
- 2–4 short sentence stems the student can finish out loud:
  *"My favourite thing is…"*, *"I'd probably…"*, *"The problem is…"*.
- They help the student begin. They do not answer the question for them.

### Not part of the model: Student Goal
New Waffles do **not** have a Student Goal (`student.goal`). Some existing
Business and Kids records still have one for compatibility; leave those alone
unless a task explicitly says otherwise. Do not add a Goal to new Waffles
unless this specification is changed.

---

## Conversation starter vs activity

| A conversation starter… | An activity… |
|---|---|
| opens a topic with an interesting angle | sets up a task to complete |
| can go in many directions | has steps, stages or a set path |
| needs no setup | needs rules explained first |
| has no correct answer or outcome | has a goal, score, winner or finish line |
| is read in seconds | has to be read, understood and planned |
| lets the teacher follow the student | makes the teacher run a procedure |

**A Waffle is NOT:** an activity, worksheet, exercise, lesson plan,
multi-stage task, game with rules, scavenger hunt, grid, extended roleplay,
teacher script, or mini lesson.

### What must not creep in
- section labels or sub-headings inside a prompt
- numbered or bulleted steps
- rules, rounds, points, scores, timers, winners, stages, grids, checklists
- "first do this, then do that" sequences
- scripted follow-ups, rescue lines or branching teacher instructions
- background explanations the teacher must read before starting
- goals, success criteria or quotas ("mention at least three…")
- long lists of options for the student to process
- a Student Goal field

A short roleplay set-up is fine when it is one sentence and the talking starts
immediately ("Play a customer returning a broken phone"). A roleplay with
roles, stages or rules is an activity.

---

## Remove unnecessary complexity

When writing or reviewing a Waffle, keep cutting until anything more would
lose the conversation:

- If a sentence explains something the teacher would work out anyway, cut it.
- If the Student Prompt already gives a detail, the Teacher Prompt does not
  need to repeat it.
- If there are two ideas, keep the better one and make it another Waffle.
- If it needs a "Stuck" line, the prompt is probably too hard — simplify the
  prompt instead.

**Interesting does not mean complicated.** A Waffle becomes interesting
through a specific angle, detail, situation or perspective — not through more
instructions, options or mechanics. *"What's your favourite food?"* is dull;
*"Tell me about a meal that reminds you of a particular time in your life"* is
interesting, and it is still one sentence.

---

## Level and age appropriateness

- **A1/A2:** concrete, familiar, personal topics; short simple sentences;
  starters do most of the lifting. No abstract debates.
- **B1:** opinions, experiences, simple choices and comparisons with reasons.
- **B2+:** nuance, trade-offs, hypotheticals and disagreement — still one
  short prompt. Harder thinking, not more instructions.
- **Kids:** age-appropriate, playful and safe topics, in simple wording at
  every level. Kids Waffles use exactly the same model as every other
  Collection — no extra sections, engines or teacher scripts.
- **Business:** workplace situations for adults. Same model.

## Category changes the subject, not the mechanics

A Collection or category (Describe, Gaming, Everyday Situations, Weird &
Gross, meetings, …) changes **what** people talk about. It never changes
**how** a Waffle works. Every Waffle in every Collection has the same four
elements and passes the same two tests.

---

## Length guidance (warnings, not gates)

These are normal upper limits. `scripts/validate.js` warns above them; it
does not fail. Slightly over is fine if the Waffle passes the two tests.
Well over usually means the Waffle is conducting rather than starting.

| Element | Normally |
|---|---|
| Teacher Prompt | ≤ 30 words |
| Language Focus | ≤ 12 words |
| Student Prompt | ≤ 25 words |
| Each Conversation Starter | ≤ 6 words |
| Number of Starters | 2–4 |

---

## Examples

These show the target model (the Starters illustrate the new element; most
existing General Waffles pre-date it).

**General English · A1/A2 · Describe**
- Teacher Prompt: Ask the student to describe their bedroom — the furniture, the colours and their favourite thing in it.
- Language Focus: Describing a place ('There is/are', 'It has').
- Student Prompt: Tell your teacher about your bedroom and your favourite thing in it.
- Starters: "In my bedroom there's…" · "My favourite thing is…" · "The walls are…"

**General English · B1 · Everyday Situations**
- Teacher Prompt: Find out which monthly subscription the student would cancel, and why.
- Language Focus: Making a decision and giving reasons ('I'd… because…').
- Student Prompt: Your subscriptions are adding up. Which one would you cancel?
- Starters: "I'd cancel… because…" · "I hardly ever use…" · "I couldn't live without…"

**General English · B2+ · Simple Roleplay**
- Teacher Prompt: Roleplay: the student finally raises a friend's habit of cancelling plans at the last minute.
- Language Focus: Raising a problem tactfully and acknowledging feelings.
- Student Prompt: Your friend keeps cancelling plans at the last minute. Talk to them about it.
- Starters: "Can I mention something?" · "I get that you're busy, but…" · "It's happened a few times…"

**Kids · A1/A2 · Weird & Gross**
- Teacher Prompt: Ask the student how they feel when they hear their own recorded voice.
- Language Focus: Describing feelings and sounds ('It sounds…', 'I feel…').
- Student Prompt: How does your voice sound in a video? Do you like it?
- Starters: "My voice sounds…" · "I feel…" · "It's really weird because…"

**Business · A1/A2 · Everyday Situations**
- Teacher Prompt: Ask what the student thinks of a new rule: everyone must wear a name badge every day.
- Language Focus: Giving opinions ('I think', 'I don't think').
- Student Prompt: Your company says everyone must wear a name badge every day. What do you think?
- Starters: "I think badges are…" · "For new people…" · "At my work, we…"

**Drift example — too much:** a scene, then `Ask:`, `Teacher:` (explore X,
then challenge Y), `Quick:` and `Stuck:` lines. That is a teacher script.
Reduce it to one Teacher Prompt; let the teacher's own follow-up do the rest.

---

## Scope and precedence

- Applies to **all current and future Collections**, and to any creation,
  editing, review or generation of Waffles.
- Existing Waffles that do not yet match this model (for example the Kids
  Waffles' multi-section Teacher prompts, General Waffles without Starters,
  and existing Goal fields) are **not** retrofitted automatically. They are
  changed only in an explicit rewrite task.
- **Superseded guidance.** Where these older documents conflict with this
  specification, this specification wins. They are kept for history only:
  - `design/` (including `PROJECT_STATE.md`, `level_design.md`,
    `prompt_plan.md`, the prompt drafts, and `prompt_philosophy.md`, whose
    core ideas are carried forward here)
  - `wafflebrain-kids/*.md` (the "engine" and Hook/Ask/Teacher/Quick/Stuck
    architecture)
  - `WaffleBrain Prompt Rewrite/` (the 2026-07 conversion style guides)
  - `data/waffle_system_spec.md` (old menu spec; its use of "Waffle" to mean
    a Collection is obsolete)
