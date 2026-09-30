# WaffleBrain Waffle Content Rules

**This is the canonical specification for WaffleBrain content.** It applies to
every Waffle in every Collection — General English, Kids, Business, and every
future Collection — at every level and on every theme. Where older guidance
disagrees (see the end of this file), this document wins.

---

## The principles

> **A Waffle should start a conversation, not conduct a conversation.**

> **Every Student Waffle should clearly initiate a conversation between the
> student and the teacher.**

A **Waffle** is one conversation starter. The conversation that follows *is*
the activity. The Waffle's only job is to get a teacher and student talking
naturally about something interesting, and to give that talk somewhere to go.

- **The Teacher side creates the interesting situation.**
- **The Student side turns that situation into a natural student → teacher
  conversation.** The student is talking *with* the teacher — sharing,
  asking, comparing — not completing a hypothetical exercise, solving a
  dilemma, performing a roleplay, or answering a standalone question.

The models:
- **Teacher side:** the simplicity and immediacy of the General English
  Teacher Waffles — one clear situation or angle, one short prompt, and the
  teacher is off.
- **Student side:** the 30 standalone Student Waffles in `studentSupport.js`
  (the General English Student page) — "Ask your teacher about the best meal
  they've ever eaten", a Goal about the teacher, and Starters that invite the
  teacher in.

---

## The three tests

Every Waffle must pass all three:

1. **The two-second test** — Could a teacher glance at this for two seconds
   and immediately start a natural conversation?
2. **The starter test** — Does this *start* a conversation, or does it
   *conduct* an activity?
3. **The "with the teacher" test** (Student side) — Is it obvious the student is starting a
   conversation *with the teacher*, and what they want to find out about the
   teacher's side?

If a Waffle needs several instructions, stages, explanations or teacher
decisions before the talking can begin, it has drifted from a Waffle into an
activity. Simplify it.

---

## The five content elements

Every new Waffle has exactly these five content elements, and nothing else:

| Side | Element | Data field | What it is |
|---|---|---|---|
| Teacher | **Teacher Prompt** | `teacher.prompt` | One short conversational prompt the teacher can use straight away. |
| Teacher | **Language Focus** | `teacher.constraint` | One short sentence naming the language or conversational behaviour to encourage. |
| Student | **Student Prompt** | `student.prompt` | One short, natural invitation to start a conversation with the teacher. |
| Student | **Student Goal** | `student.goal` | One short conversation goal: what to find out, discover or compare about the teacher. |
| Student | **Conversation Starters** | `student.starters` | 2–4 short, natural things to say that begin the conversation, including at least one that invites the teacher in. |

The record also carries its permanent `id`, `collection`, `level` and
`category` (see `CLAUDE.md` for the data rules). For compatibility, new
Waffles also set `student.constraint` to the same text as
`teacher.constraint`; the Student page does not show it.

The three Student elements work together as one conversation:

- **Student Prompt** = what conversation to start.
- **Student Goal** = what to discover about the teacher.
- **Starters** = how the student can naturally begin talking.

> **Student Prompt:** Ask your teacher about the best meal they've ever eaten.
> **Goal:** Find out what made it so memorable.
> **Starters:** "Where was it?" · "What made it so good?" · "Would you go back?"

This is the model to use.

### Teacher Prompt
- One prompt, normally one sentence. Plain text on one line.
- Says what to talk about and gives it an angle. It is not a script.
- It can hold the interesting scenario or dilemma; the Student side turns
  that into a conversation with the teacher.
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
- One short, natural invitation to talk **with the teacher**.
- Preferred forms: *Ask your teacher about…*, *Tell your teacher about…*,
  *Tell your teacher what…*, *Ask your teacher what they think about…*,
  *Describe to your teacher…*, *Explain to your teacher…*,
  *Talk to your teacher about…*.
- Other natural constructions are fine when they sound better — *Talk about
  a time…*, *Describe something you…*, *Explain what you would…* — as long as
  it is clear the student is talking with the teacher. The rule is about
  conversational function, not a fixed template; do not force every prompt
  into "Ask your teacher" / "Tell your teacher".
- Not a standalone question for the student to answer ("Would you try
  them?"), not a worksheet instruction, not a roleplay set-up.
- The scenario can live here in a few words when needed:
  *"Tell your teacher what you'd do if a boy kicked a robot that keeps saying
  'Help, please.'"*

### Student Goal
A **conversation goal**, not a learning objective or activity outcome.

- Tells the student what they are trying to find out, discover, compare or
  discuss **about the teacher**: the teacher's experience, opinion,
  knowledge, preference, story or perspective.
- Normally about 5–12 words, one sentence.
- Must not simply repeat the Student Prompt.
- Good: *Find out what your teacher would like to learn too.* ·
  *See if your teacher has ever had the same experience.* ·
  *Find out what your teacher would choose.* ·
  *See what your teacher thinks happened.*
- Not: *Put the ideas in order and explain your rule.* ·
  *Decide what to do and justify it.* · *Use three adjectives.* — those are
  activity objectives.

### Conversation Starters
- 2–4 short things a student could genuinely say aloud to begin or continue
  the conversation: *"I'd love to learn…"*, *"What about you?"*,
  *"Where was it?"*, *"Have you ever…?"*, *"I've never tried that…"*.
- **At least one should normally invite the teacher in** — usually a
  question to the teacher.
- A partial phrase is fine when it sounds like natural speech.
- They help the student begin. They do not answer the question for them.
- Not grammar or sentence-completion exercises. Avoid frames such as
  *"I think…, because…"*, *"I'd choose…, because…"*,
  *"It could be because…"*, *"The most important thing is…"*,
  *"People needed… to…"* — especially blanks in the middle of a sentence.

---

## Conversation starter vs activity

| A conversation starter… | An activity… |
|---|---|
| opens a topic with an interesting angle | sets up a task to complete |
| can go in many directions | has steps, stages or a set path |
| needs no setup | needs rules explained first |
| has no correct answer or outcome | has a score, winner or finish line |
| is read in seconds | has to be read, understood and planned |
| lets the teacher follow the student | makes the teacher run a procedure |
| is a two-way talk with the teacher | is a task the student performs for the teacher |

**A Waffle is NOT:** an activity, worksheet, exercise, lesson plan,
multi-stage task, game with rules, scavenger hunt, grid, extended roleplay,
teacher script, or mini lesson — on either side.

### What must not creep in
- section labels or sub-headings inside a prompt
- numbered or bulleted steps
- rules, rounds, points, scores, timers, winners, stages, grids, checklists
- "first do this, then do that" sequences
- scripted follow-ups, rescue lines or branching teacher instructions
- background explanations the teacher must read before starting
- activity objectives, success criteria or quotas ("mention at least
  three…", "put them in order") — including in the Student Goal
- long lists of options for the student to process
- Student Prompts that are standalone questions or exercises rather than a
  conversation with the teacher
- Starters that are grammar or sentence-completion frames

A short roleplay set-up is fine on the Teacher side when it is one sentence
and the talking starts immediately ("Play a customer returning a broken
phone"). A roleplay with roles, stages or rules is an activity.

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

The conversational structure is the same at every level. Only the language,
complexity and subject matter change — the student is always talking *with*
the teacher.

- **A1/A2:** concrete, familiar, personal topics; very short, simple
  sentences and vocabulary; concrete questions to the teacher; Starters do
  most of the lifting. No abstract debates.
- **B1:** opinions, experiences, prediction, simple choices and comparisons
  with reasons; slightly more explanation.
- **B2+:** nuance, evidence, competing perspectives, trade-offs, hypotheticals
  and abstract ideas where appropriate — still one short prompt. Harder
  thinking, not more instructions.
- **Kids:** age-appropriate, playful and safe topics, in simple wording at
  every level. Kids Waffles use exactly the same model as every other
  Collection — no extra sections, engines or teacher scripts.
- **Business:** workplace situations for adults. Same model.

## Category changes the subject, not the mechanics

A Collection or category (Describe, Online Life, Everyday Situations,
Games & Entertainment, meetings, …) changes **what** people talk about. It never changes
**how** a Waffle works. Every Waffle in every Collection has the same five
elements and passes the same tests.

---

## Length guidance (warnings, not gates)

These are normal upper limits. `scripts/validate.js` warns above them; it
does not fail. Slightly over is fine if the Waffle passes the tests.
Well over usually means the Waffle is conducting rather than starting.

| Element | Normally |
|---|---|
| Teacher Prompt | ≤ 30 words |
| Language Focus | ≤ 12 words |
| Student Prompt | ≤ 25 words |
| Student Goal | about 5–12 words |
| Each Conversation Starter | ≤ 6 words |
| Number of Starters | 2–4 (required for new Waffles) |

---

## Examples

These show the target model. The Student sides follow the `studentSupport.js`
model; most existing records pre-date it.

**General English · A1/A2 · Describe**
- Teacher Prompt: Ask the student to describe their bedroom — the furniture, the colours and their favourite thing in it.
- Language Focus: Describing a place ('There is/are', 'It has').
- Student Prompt: Tell your teacher about your bedroom and your favourite thing in it.
- Goal: Find out what your teacher's favourite room is.
- Starters: "In my bedroom there's…" · "My favourite thing is…" · "What about your room?"

**General English · B1 · Everyday Situations**
- Teacher Prompt: Find out which monthly subscription the student would cancel, and why.
- Language Focus: Making a decision and giving reasons.
- Student Prompt: Tell your teacher which subscription you'd cancel if you had to.
- Goal: Find out which one your teacher couldn't live without.
- Starters: "I hardly ever use…" · "I couldn't live without…" · "Which one would you keep?"

**General English · B2+ · Everyday Situations**
- Teacher Prompt: A friend keeps cancelling plans at the last minute. Ask how the student would bring it up without damaging the friendship.
- Language Focus: Raising a problem tactfully and acknowledging feelings.
- Student Prompt: Talk to your teacher about how you'd tell a friend who keeps cancelling plans that it bothers you.
- Goal: See how your teacher would handle it.
- Starters: "I'd probably start by…" · "I don't want to sound…" · "Has that happened to you?"

**Kids · A1/A2 · Opinions & Ideas**
- Teacher Prompt: A stuck delivery robot keeps saying "Help, please" while a boy kicks it. Ask the student what they'd do.
- Language Focus: Saying what you'd do and giving an opinion.
- Student Prompt: Tell your teacher what you'd do if a boy kicked a robot that keeps saying "Help, please."
- Goal: Find out if your teacher thinks robots deserve kindness.
- Starters: "I'd probably…" · "It's only a robot, but…" · "Would you stop him?"

**Business · A1/A2 · Everyday Situations**
- Teacher Prompt: Ask what the student thinks of a new rule: everyone must wear a name badge every day.
- Language Focus: Giving opinions ('I think', 'I don't think').
- Student Prompt: Tell your teacher what you think about wearing a name badge at work every day.
- Goal: Find out if your teacher has ever had to wear one.
- Starters: "For new people…" · "At my work, we…" · "Did you ever wear one?"

**Drift example — Teacher side:** a scene, then `Ask:`, `Teacher:` (explore
X, then challenge Y), `Quick:` and `Stuck:` lines. That is a teacher script.
Reduce it to one Teacher Prompt; let the teacher's own follow-up do the rest.

**Drift example — Student side:** *"Your friend always leaves the game when
they're losing. What would you say to them?"* with Starters
*"I think…, because…"* and no Goal. That is a standalone question for the
student to answer. Make it a conversation with the teacher: *"Tell your
teacher what you'd say to a friend who always quits when they're losing."* ·
Goal: *Find out what your teacher would say.* · Starters: *"I'd just say…"* ·
*"It's not fun when…"* · *"What would you do?"*

---

## Scope and precedence

- Applies to **all current and future Collections, levels and themes**, and
  to any creation, editing, review or generation of Waffles.
- Existing Waffles that do not yet match this model are **not** retrofitted
  automatically; they are changed only in an explicit rewrite task. This
  includes: General English records in `data/waffles.json` (no Goal, no
  Starters) and the older Business Student sides (521–550, 611–636). (The
  Kids Student sides were rewritten to this model on 2026-09-29/30; every
  Kids Waffle now has a Goal and Starters.)
- `studentSupport.js` (the 30 standalone Student Waffles) is the reference
  model for the Student side. Do not edit it as part of a content-rules task.
- **Superseded within this document:** the earlier (2026-09-29) model without
  a Student Goal is replaced by the five-element model above. The Student Goal is a permanent
  field, and it is a *conversation* goal.
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
