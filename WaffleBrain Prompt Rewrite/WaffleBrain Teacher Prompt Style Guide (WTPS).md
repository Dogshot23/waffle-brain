# WaffleBrain Teacher Prompt Style Guide (WTPS)

Version: 3.0 (Final)

---

# Purpose

The original `prompts.json` contains excellent student-facing prompts.

The purpose of this guide is NOT to rewrite or improve those prompts.

The purpose is simply to convert them into teacher cue cards that a teacher can read aloud naturally during a live lesson.

---

# Golden Rule

A teacher should be able to read every prompt aloud immediately without mentally rewriting it.

If the teacher would naturally change the wording before speaking, the conversion is incorrect.

---

# Source of Truth

The original `prompts.json` is always the ONLY source of truth.

Never use previous rewritten prompts as reference.

Never combine wording from previous rewrites.

Always begin from the original prompt.

---

# Overall Philosophy

Preserve the original prompt.

Preserve the original activity.

Preserve the original structure.

Only change wording that prevents natural teacher delivery.

---

# What MUST Never Change

Never change:

• learning activity

• scenario

• CEFR level

• vocabulary difficulty

• grammar difficulty

• order of information

• number of choices

• number of follow-up questions

• cognitive load

• formatting

• headings

• bullet lists

• JSON structure

• JSON keys

• constraint fields

---

# What MAY Change

Only the teacher-facing delivery.

Nothing else.

---

# The Teacher Test

Before returning a prompt ask yourself:

"If I were teaching on Cambly, Preply or iTalki, could I simply read this aloud to a brand-new student?"

If the answer is YES

leave it.

If the answer is NO

change only enough wording to make it sound natural.

---

# The Scenario Rule

Never present hypothetical situations as if they are facts.

A teacher does not naturally say:

❌

Your friend is visiting your town.

A teacher naturally says things like:

✓ Imagine your friend is visiting your town.

✓ Suppose your friend is visiting your town.

✓ Let's imagine your friend is visiting your town.

✓ Pretend your friend is visiting your town.

✓ Think about this situation...

Your friend is visiting your town.

---

Likewise

❌

You planned a day outside.

Better

✓ Imagine you planned a day outside.

✓ Suppose you planned a day outside.

✓ What would you do if you planned a day outside?

---

Likewise

❌

You need to buy a birthday present.

Better

✓ Imagine you need to buy a birthday present.

✓ Suppose you need to buy a birthday present.

✓ Pretend you need to buy a birthday present.

✓ What would you do if you needed to buy a birthday present?

---

# Approved Teacher Introductions

When the opening does not sound natural as spoken teacher language, rewrite ONLY the opening using ONE of these approved patterns.

---

Imagine...

Imagine you're...

Imagine you have...

Imagine there is...

---

Let's imagine...

Let's say...

---

Suppose...

Suppose you're...

Suppose your friend...

Suppose a visitor...

Suppose a tourist...

---

Pretend...

Pretend you're...

Pretend you have...

Pretend your friend...

---

Think about this situation...

Think of a situation where...

Picture this...

---

What would you do if...

How would you...

If you needed to...

---

Use whichever introduction sounds most natural for that particular scenario.

Do NOT invent additional opening styles.

---

# Choosing an Introduction

Natural spoken English is the priority.

NOT consistency.

NOT minimal editing.

NOT variety.

Choose whichever approved introduction sounds most natural if spoken aloud.

If the original opening already sounds perfectly natural as spoken teacher language, leave it unchanged.

---

# Headings

Preserve these headings exactly.

Choose:

Plan:

Explain:

Friends:

Create the plan.

Change the plan.

Choose solutions for:

Never rewrite these.

---

Replace only:

Tell your teacher:

↓

Then ask:

Nothing else.

---

# Pronouns

Do not unnecessarily rewrite pronouns.

Keep the original wording wherever possible.

Only change pronouns when required to make the prompt readable aloud.

---

# Constraint Fields

Constraint fields are NEVER modified.

Never alter:

• wording

• punctuation

• spacing

• grammar

• capitalisation

Copy them byte-for-byte.

---

# Forbidden Behaviour

Never:

• improve the activity

• redesign the activity

• simplify

• expand

• add examples

• remove information

• merge prompts

• split prompts

• change CEFR

• rewrite constraints

• invent scenarios

• invent teaching advice

• explain grammar

• convert cue cards into lesson plans

---

# Opening Algorithm

For every prompt:

Step 1

Read ONLY the first sentence.

Step 2

Ask:

"If I read this aloud exactly as written, would it sound natural?"

If YES

Leave it.

If NO

Rewrite ONLY the opening using one approved teacher introduction.

Leave the remainder of the prompt unchanged wherever possible.

---

# Quality Checklist

Before returning JSON verify:

✓ Same number of prompts

✓ Same learning activity

✓ Same scenario

✓ Same CEFR level

✓ Same choices

✓ Same follow-up questions

✓ Same formatting

✓ Same headings

✓ Same JSON structure

✓ Constraints unchanged

✓ Teacher could read every prompt aloud naturally

✓ Original prompt remains immediately recognisable

If any check fails,

correct it before returning the JSON.

---

# Final Objective

The finished prompt should feel as though the original WaffleBrain prompt has simply been placed into the hands of a teacher.

The learning activity should be identical.

The student experience should be identical.

The only difference is that the teacher no longer has to mentally rewrite the prompt before speaking.