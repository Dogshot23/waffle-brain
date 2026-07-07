# Global Architectural Audit: B2+ Prompt Bank

## 1. Cross-Category Overlap

The most significant overlap is between **Everyday Situations** and **Simple Roleplay**. Many items are the same underlying scenario, differing only in whether the learner narrates the reasoning or performs the dialogue:

- Everyday Situations #10 (friend chronically late) vs. Simple Roleplay #17 (friend cancels last-minute) — same "raise a low-grade grievance without damaging the friendship" reasoning shape.
- Everyday Situations #19/#27 (family disagreement over shared responsibility/possessions) vs. Simple Roleplay #23 (housemate chore renegotiation) — identical "propose a fair system, justify it isn't self-serving" logic.
- Everyday Situations #29 (friend's annoying habit, say something or not) vs. Simple Roleplay #6 (roommate boundary-setting) — same suppressed-irritation-to-confrontation arc.

This is likely intentional to some degree (Roleplay is meant to dramatize situations also implied in Everyday Situations), but several pairs aren't just thematically adjacent — they replicate the *same decision architecture* ("weigh cost of speaking up vs. staying silent, then justify your approach"), which is the more important kind of duplication to flag.

There's a second overlap cluster between **Describe** and **Explain and Show**: Describe #23 ("moment you noticed you were more run-down than usual, explain the signs your body gave") is nearly identical in content and reasoning to Explain and Show #23 ("explain the early warning signs that someone is more tired/run-down than they realise"). These are the same task wearing two different genre labels — one has the learner introspect, the other has them teach — but the underlying content payload (recognizing fatigue signals) is the same, which is a missed opportunity for wider domain coverage in two separate slots.

**Choose and Create** and **Everyday Situations** overlap in a subtler way: Choose and Create #5 (invent fairer chore-split for mismatched schedules) duplicates Everyday Situations #1 (design a fairer chore system with an uneven roommate). Both ask for a justified fairness system for chores — the "design + justify fairness" pattern appears at least three times across the bank total (Everyday Situations #1, Choose and Create #5, Simple Roleplay #23).

## 2. Reasoning-Pattern Balance

Across the whole B2+ level, a few cognitive patterns are heavily overused:

- **"Diagnose the underlying cause before proposing a fix"** appears constantly (Everyday Situations #2, #13, #23; Explain and Show #16, #24; Describe #0). This is a valuable pattern, but its repetition — nearly always applied to habits, procrastination, or friend behavior — makes several prompts feel interchangeable regardless of category.
- **"Justify a decision by weighing competing priorities/trade-offs"** is the dominant closing constraint almost everywhere — Everyday Situations, Choose and Create, and Simple Roleplay all lean on it heavily. It's a legitimate B2+ skill (justification/hedging language), but its near-total dominance crowds out other valuable reasoning moves.
- **"Anticipate objections / address the other side"** is present but comparatively rare and could be expanded — it's a distinct and valuable skill (concession clauses, counter-argument) currently only lightly used (Simple Roleplay #8, #16; Choose and Create #7, #18).

Patterns that are largely **missing**:
- **Comparative evaluation of options with quantifiable/measurable criteria** (e.g., cost-benefit with numbers, not just qualitative "weigh the trade-offs").
- **Hypothetical/counterfactual reasoning** ("what would you have done differently," "how would this play out if X hadn't happened") is basically absent — Guided Stories comes close but doesn't ask learners to reason counterfactually, only to narrate.
- **Persuasion under direct disagreement/pushback** (i.e., a prompt that requires handling live pushback, not just anticipating one objection) is thin.
- **Self-correction / admitting you were wrong in real time** — present narratively in Guided Stories (#5, #20) but not as a live spoken-reasoning task elsewhere.

Because "diagnose then justify" so dominates Everyday Situations, Explain and Show, and Choose and Create, those three categories can start to feel like variations on one reasoning template rather than three distinct cognitive exercises — this is the deeper issue underlying the category-identity question below.

## 3. Domain Balance

Rough domain tally across all 180 B2+ prompts:

- **Relationships/family/friends**: heavily overrepresented — easily 40%+ of the bank (roommates, siblings, aging parents, friendships, breakups, romantic partners recur in every single category).
- **Work/professional**: moderate presence, concentrated in Simple Roleplay and Explain and Show (manager negotiations, colleague disputes, presentations, feedback).
- **Money/consumer**: present but narrow — mostly returns/complaints and price negotiation, rarely broader financial reasoning (budgeting, saving philosophy, investment risk beyond Simple Roleplay #1).
- **Health**: thin — largely limited to fatigue/tiredness (repeated twice, see overlap above), minor injury first aid, and convincing someone to see a doctor. No prompts touch on managing chronic stress, mental health conversations directly, or health-system navigation.
- **Technology**: present only lightly (Describe #4, Explain and Show #12, #2) and mostly framed as an annoyance or teaching task, not as a genuine technology-domain reasoning problem (e.g., no prompts on digital privacy trade-offs, app choice, AI tools, etc.).
- **Travel**: reasonably present (trip planning, negotiating a package holiday, solo travel prep) but concentrated almost entirely in Simple Roleplay and Explain and Show.
- **Community/civic/public services**: fairly good coverage in Everyday Situations (council decisions, quiet hours, recycling, package theft) but nearly absent elsewhere.
- **Culture/identity**: very thin — only Explain and Show #11 (unwritten cultural rule) touches this directly.
- **Education**: present mostly through the "student/tutor" framing (Simple Roleplay #15) and via a "child/teenager" framing device, not as a standalone domain (e.g., no prompts about choosing courses, dealing with academic pressure, adult learning).
- **Home/domestic**: heavily represented, often overlapping with the relationship overrepresentation (shared living spaces, chores, decluttering).
- **Shopping/consumer transactions**: adequately covered in Simple Roleplay and Explain and Show.

**Flagged gaps**: culture/identity, technology-as-a-substantive-domain (not just "annoying gadget"), and mental health/emotional wellbeing as a topic in its own right (rather than only as a relationship-management vehicle) are the weakest spots. Given this is a B2+ conversational bank, these are exactly the domains fluent speakers are expected to be able to discuss.

## 4. Category Identity

**Everyday Situations** — Its distinct purpose is *first-person practical/ethical decision-making narrated as reasoning*: "here's a real-life dilemma, walk me through how you'd handle it." It's the most JSON of the categories in the sense that it's reasoning-forward and doesn't require performance. This identity holds well across most of the 30 items.

**Simple Roleplay** — Its distinct purpose is *live, two-party spoken negotiation/performance*: the learner has to hold a persona and respond in real time, not just describe a plan. This is clearly differentiated by the instruction verbs ("play," "act out"). However, several entries (e.g., #9 sibling skipping family gatherings, #17 friend cancelling last-minute) are conceptually indistinguishable from Everyday Situations prompts and could just as easily sit there — the *scenario* doesn't inherently require performed dialogue, it's just been relabeled as roleplay. A cleaner identity boundary would reserve Roleplay for scenarios that specifically hinge on live back-and-forth (negotiation, real-time pushback, mediating between two other people), which most of the category already does well (the negotiation and mediation prompts, e.g. #5, #12, #21, are excellent fits).

**Describe** — Its distinct purpose is *reflective, descriptive characterization of a person, place, object, or personal pattern*, with an analytical "why" layered on top of the description. This category is well-differentiated from the others because it doesn't require a decision or a dialogue, only sustained descriptive/explanatory monologue. It holds its identity well, with the one exception noted above (fatigue-signs prompt, #23) which reads more like an Explain and Show task since it's teaching recognition of signs rather than describing a personal quality.

**Explain and Show** — Its distinct purpose is *procedural/instructional explanation to a named audience* — teaching a skill, process, or judgment call to someone else. This is a strong, clear identity (the "explain to X how to Y" structure is consistent), but a few prompts drift toward Everyday Situations because they ask the learner to reason through a dilemma on someone else's behalf rather than actually teach a transferable process (e.g., #9 defusing a family argument, #13 comforting an upset friend function more like advice-giving in a difficult relational moment than genuine "how-to" instruction). These would fit comfortably in Everyday Situations instead.

**Choose and Create** — Its distinct purpose is *design/invention under constraints*, typically producing a system, plan, or artifact rather than resolving a single dilemma. This is generally well-executed and distinct — the recurring "design a system, then explain what happens when it breaks" structure is a genuinely different cognitive task from the other categories. A few items (e.g., #5 chore-split invention, #25 reviving a friendship) are closer to Everyday Situations' decision-reasoning mode than to genuine design/invention, since they don't produce a structural artifact so much as a single relational decision.

**Guided Stories** — Its distinct purpose is *first-person narrative construction with an imposed structural constraint* (chronology, foreshadowing, parallel threads, retrospective correction). This is the most structurally unique category, since every other category is fundamentally argumentative/explanatory while this one is narrative. It holds its identity very well.

## 5. Structural Duplication

Beyond the reasoning-pattern repetition in §2, there are literal repeated **constraint structures** worth flagging independent of topic:

- The exact constraint "Explain why one decision made everything else happen" appears **five times** in Guided Stories (#3, #9, #14, #22, #26), always attached to different topics but demanding an identical narrative technique (a single pivotal-decision causal chain). This is the single most repeated structural element in the entire bank.
- "Include a moment where your opinion completely changes" appears four times in Guided Stories (#2, #10, #17, #24) — a second heavily reused structural device in the same category.
- "Reveal the key information only near the end" appears three times (#0, #12, #29) — a third recurring device.
- Across categories, the "rank/prioritize three options and justify the ranking" structure recurs almost identically in Everyday Situations #5, Choose and Create #2, #7, #16, #22 — five near-identical decision structures.

Guided Stories in particular is efficient at reusing a small set of narrative-technique constraints across many topics — which is reasonable for a 30-item narrative category built around teachable storytelling devices, but it does mean the category's variety comes entirely from topic, not structure. Combined with only ~6 underlying structural constraints doing duty across 30 stories, the category would benefit most from structural (not topical) diversification.

## 6. Coverage Gaps

Genuinely missing and valuable for B2+ speakers:

- **A prompt requiring the learner to change someone's mind who is actively, vocally disagreeing in the moment** (live persuasion under resistance), rather than anticipating an objection in advance.
- **A prompt on discussing a technology or AI-related trade-off** (privacy vs. convenience, automation vs. jobs, screen time as a societal rather than personal-habit issue) — the bank currently treats tech only at the level of a broken gadget.
- **A prompt on navigating a public-service or bureaucratic system** (e.g., appealing a decision, dealing with a long wait or unhelpful institution) — Everyday Situations touches civic issues but nothing simulates dealing with an institution/bureaucracy directly.
- **A prompt explicitly about giving unsolicited difficult feedback to someone senior/older** (reverse power-dynamic feedback) — most feedback-related prompts flow downward or peer-to-peer.
- **A hypothetical/counterfactual reasoning prompt** ("if you could redo one decision, what would change") is entirely absent as a category of task, despite being a natural, high-value B2+ speaking skill.

## 7. Minimal Improvement Plan

To meaningfully improve the bank with the fewest changes:

1. **Replace Explain and Show #23** (fatigue-signs prompt) — it duplicates Describe #23 almost exactly. Replace with a genuine procedural teaching prompt in an underrepresented domain, ideally technology or public-services (e.g., teaching someone how to dispute a bill or navigate a bureaucratic appeal). This fixes both the cross-category duplication (§1) and a domain gap (§3) in one move.

2. **Replace one of the two "diagnose-then-fix" habit prompts in Everyday Situations** (#2 or #23 — friend's exercise habit vs. own procrastination) — these are structurally identical diagnostic tasks. Replace one with a live-pushback persuasion prompt (§6 gap #1), which also rebalances the overused "diagnose then justify" pattern (§2).

3. **Replace Simple Roleplay #9** (sibling skipping family gatherings) — it's functionally indistinguishable from an Everyday Situations dilemma and doesn't require true live negotiation. Replace with a prompt that specifically requires holding ground against active spoken resistance (not just raising a concern), which strengthens Roleplay's distinct identity (§4) and covers gap #1 in §6.

4. **Replace one of the five "single pivotal decision" Guided Stories constraints** (e.g., #26) with a structurally different device — a counterfactual framing ("tell it, then say how it would have gone if you'd chosen differently"). This introduces the missing counterfactual reasoning pattern (§6) while reducing structural over-repetition in Guided Stories (§5).

5. **Replace Choose and Create #5** (chore-split invention) — it duplicates the "fair chore system" task already covered in Everyday Situations #1 and echoed in Simple Roleplay #23. Replace with a genuine design/invention task in a currently-thin domain, such as designing something around a cultural or technology practice, addressing both the domain gap (§3) and the cross-category triplication (§1).

These five swaps target the highest-yield problems (the clearest duplications, the most overused constraint structures, and the most conspicuous coverage gaps) without requiring a broad rewrite of the bank.