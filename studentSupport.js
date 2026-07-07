// ─────────────────────────────────────────────
//  WaffleBrain — studentSupport.js
//  Student-facing scaffolding, keyed by level and category.
//
//  STUDENT_SUPPORT[level][category] = {
//    usefulEnglish:  string[]   // key words/phrases relevant to the topic
//    trySaying:      string[]  // sentence starters / model chunks
//    keepGoing:      string     // a follow-up question to extend speaking time
//    challenge:      string     // one small stretch goal for stronger students
//  }
//
//  This file is intentionally separate from prompts.json.
//  Support content is shared across every prompt in a level/category —
//  it does not vary per individual prompt, so it does not belong
//  inside the (potentially thousands-of-entries) prompt bank.
//
//  Coverage required: every level x category combination that exists
//  in prompts.json. Currently: 3 levels x 6 categories = 18 entries.
//
//  REVISION NOTE:
//  Trimmed for cognitive load. Students should spend time speaking,
//  not reading. Where usefulEnglish and trySaying communicated the
//  same idea, the stronger version was kept and the weaker one cut.
//  Caps applied: A1A2/B1 → usefulEnglish max 2, trySaying max 1 frame.
//  B2+ → usefulEnglish max 1, trySaying: [] (advanced students
//  generate their own frames, but the key is always present as an
//  empty array so every entry keeps the same shape; keepGoing and
//  challenge are unchanged at every level).
// ─────────────────────────────────────────────

const STUDENT_SUPPORT = {

  // ───────────────────────────── A1A2 ─────────────────────────────
  "A1A2": {

    "Everyday Situations": {
      usefulEnglish: [
        "can / can't",
        "because (for reasons)"
      ],
      trySaying: [
        "I think you should..."
      ],
      keepGoing: "What would you do if that didn't work?",
      challenge: "Try to give two different reasons, not just one."
    },

    "Describe": {
      usefulEnglish: [
        "big, small, old, new",
        "next to, in, on"
      ],
      trySaying: [
        "My favourite thing is... because..."
      ],
      keepGoing: "What's your favourite part, and why?",
      challenge: "Try to use three different adjectives."
    },

    "Explain and Show": {
      usefulEnglish: [
        "it's easy / it's difficult",
        "for example"
      ],
      trySaying: [
        "First, you..."
      ],
      keepGoing: "What happens if you forget a step?",
      challenge: "Try to explain it in exactly three steps."
    },

    "Simple Roleplay": {
      usefulEnglish: [
        "How much is...?",
        "I'd like..."
      ],
      trySaying: [
        "Excuse me, can I...?"
      ],
      keepGoing: "What do you say if they say no?",
      challenge: "Try to stay in the role and not switch to explaining."
    },

    "Choose and Create": {
      usefulEnglish: [
        "the best thing is...",
        "one problem is..."
      ],
      trySaying: [
        "I choose... because..."
      ],
      keepGoing: "Why didn't you choose the other option?",
      challenge: "Try to compare your choice with one you didn't pick."
    },

    "Guided Stories": {
      usefulEnglish: [
        "past simple (went, saw, had)",
        "so (for result)"
      ],
      trySaying: [
        "One day, ..."
      ],
      keepGoing: "How did the story end? What happened next?",
      challenge: "Try to use three time words to order your story."
    }
  },

  // ────────────────────────────── B1 ──────────────────────────────
  "B1": {

    "Everyday Situations": {
      usefulEnglish: [
        "I'd recommend... / You could try...",
        "on the other hand"
      ],
      trySaying: [
        "If I were you, I'd..."
      ],
      keepGoing: "What could go wrong with that plan, and how would you fix it?",
      challenge: "Try to give advice using a conditional (if... / unless...)."
    },

    "Describe": {
      usefulEnglish: [
        "compared to...",
        "-ish / kind of / a bit"
      ],
      trySaying: [
        "What stands out most is..."
      ],
      keepGoing: "How would you describe it to someone who's never seen it?",
      challenge: "Try to include a comparison, not just a list of features."
    },

    "Explain and Show": {
      usefulEnglish: [
        "a common mistake is...",
        "in other words"
      ],
      trySaying: [
        "Make sure you..., otherwise..."
      ],
      keepGoing: "What would you tell a complete beginner to watch out for?",
      challenge: "Try to explain why each step matters, not just what to do."
    },

    "Simple Roleplay": {
      usefulEnglish: [
        "I see what you mean, but...",
        "let's find a compromise"
      ],
      trySaying: [
        "I was wondering if you could..."
      ],
      keepGoing: "How does the other person probably feel in this situation?",
      challenge: "Try to negotiate to an agreement, not just state your side."
    },

    "Choose and Create": {
      usefulEnglish: [
        "the downside is...",
        "it comes down to..."
      ],
      trySaying: [
        "All things considered, I'd go with..."
      ],
      keepGoing: "If your first choice weren't available, what's your backup plan?",
      challenge: "Try to name a real downside of your own choice, not just the upside."
    },

    "Guided Stories": {
      usefulEnglish: [
        "past continuous (was doing)",
        "just as / right when"
      ],
      trySaying: [
        "Little did I know that..."
      ],
      keepGoing: "Was there a moment where things could have gone differently?",
      challenge: "Try mixing past simple and past continuous in the same story."
    }
  },

  // ────────────────────────────── B2+ ─────────────────────────────
  "B2+": {

    "Everyday Situations": {
      usefulEnglish: [
        "it's a trade-off between..."
      ],
      trySaying: [],
      keepGoing: "What assumption are you making that might not hold true?",
      challenge: "Try to acknowledge a counterargument before responding to it."
    },

    "Describe": {
      usefulEnglish: [
        "what's striking about... is..."
      ],
      trySaying: [],
      keepGoing: "Is there anything about it that surprises you, or contradicts first impressions?",
      challenge: "Try to describe an impression, not just physical facts."
    },

    "Explain and Show": {
      usefulEnglish: [
        "the underlying logic is..."
      ],
      trySaying: [],
      keepGoing: "Where does this approach tend to break down, or stop working?",
      challenge: "Try to explain one exception or limitation, not just the general rule."
    },

    "Simple Roleplay": {
      usefulEnglish: [
        "I take your point, but..."
      ],
      trySaying: [],
      keepGoing: "What would it take for you to change your position here?",
      challenge: "Try to concede one small point before making your counter-argument."
    },

    "Choose and Create": {
      usefulEnglish: [
        "the crux of the matter is..."
      ],
      trySaying: [],
      keepGoing: "What would have to change for you to make the opposite choice?",
      challenge: "Try to hold two competing priorities in tension before deciding."
    },

    "Guided Stories": {
      usefulEnglish: [
        "in hindsight..."
      ],
      trySaying: [],
      keepGoing: "How did that experience change your perspective afterwards?",
      challenge: "Try to include a moment of reflection, not just a sequence of events."
    }
  }

};
