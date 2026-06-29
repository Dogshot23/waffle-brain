// ─────────────────────────────────────────────
//  WaffleBrain — engine.js
//  Shared prompt engine. No DOM dependencies.
//  Exposes a single global: WB
// ─────────────────────────────────────────────

const WB = (() => {

  // ── Private state ─────────────────────────
  let prompts      = [];   // full dataset after fetch
  let bag          = [];   // shuffle-bag (indices)
  let shown        = 0;    // running count
  let currentLevel = 'B1'; // active level (default B1)

  // ── Fisher-Yates shuffle ──────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Rebuild bag for current filter ────────
  function refillBag(categoryFilter) {
    const pool = categoryFilter
      ? prompts.reduce((acc, p, i) => {
          if (p.category === categoryFilter) acc.push(i);
          return acc;
        }, [])
      : [...Array(prompts.length).keys()];

    bag = shuffle([...pool]);
  }

  // ── Level adaptation ──────────────────────
  // Applies only for A1 and A2. B1 and above: original prompt returned as-is.
  // Each entry: { prompt, constraint }
  // Category keys must match the category strings in prompts.json exactly.

  const A1_PROMPTS = {
    'Picture Description': {
      prompt:     'Look at this picture. Point to three things. Tell me what each one is.',
      constraint: 'Accept single words or "I can see a…" One word per thing is fine.',
    },
    'Debate': {
      prompt:     'Do you like this? Say yes or no. Tell me one reason.',
      constraint: 'Use "I like… because…" or "I don\'t like… because…" One sentence is enough.',
    },
    'Storytelling': {
      prompt:     'Look at the picture. What do you see? Tell me what is happening.',
      constraint: 'Accept present simple: "There is a…", "The man is…" Two or three words per thing is fine.',
    },
    'Role Play': {
      prompt:     'You are in a café. Ask me for a coffee and a piece of cake.',
      constraint: 'Prompt with "Can I have…?" if needed. Model the phrase first if the student is unsure.',
    },
    'Questions Game': {
      prompt:     'I will ask you a question. Answer with a full sentence. Start with "I…"',
      constraint: 'Keep questions personal and concrete: name, age, family, food, colours. One sentence answers are fine.',
    },
    'Hot Takes': {
      prompt:     'Look at this. Do you like it? Tell me yes or no and one reason.',
      constraint: 'Use "I like it because…" or "I don\'t like it because…" Keep topics familiar: food, animals, weather.',
    },
    'Problem Solving': {
      prompt:     'You are hungry but the shops are closed. What do you do?',
      constraint: 'Accept very simple answers: "I cook at home." "I call a friend." One or two sentences is fine.',
    },
    'Current Events': {
      prompt:     'Tell me one thing about your day today. What did you do this morning?',
      constraint: 'Accept past simple: "I woke up at…", "I had breakfast." Correct gently and repeat back.',
    },
    'Presentation': {
      prompt:     'Tell me about your home. How many rooms does it have? What is your favourite room?',
      constraint: 'Use "My home has… rooms." and "My favourite room is… because…" Two or three sentences is enough.',
    },
    'Pronunciation': {
      prompt:     'Listen and repeat this word. Now say it in a short sentence.',
      constraint: 'Focus on one sound at a time. Praise effort. Demonstrate and repeat.',
    },
  };

  const A2_PROMPTS = {
    'Picture Description': {
      prompt:     'Describe this picture. Where are the people? What are they doing? What can you see in the background?',
      constraint: 'Use present continuous for actions: "They are…" Add one opinion: "I think they feel…"',
    },
    'Debate': {
      prompt:     'Do you prefer spending time at home or going out? Tell me which you prefer and give two reasons.',
      constraint: 'Use "I prefer… because…" and "Also,…" for the second reason. Keep topics personal.',
    },
    'Storytelling': {
      prompt:     'Tell me about a recent trip or journey — even a short one, like going to the shops. What happened?',
      constraint: 'Use past simple: "I went…", "I saw…", "Then I…" Three or four sentences is fine.',
    },
    'Role Play': {
      prompt:     'You want to change the time of an appointment. Call me and ask to reschedule.',
      constraint: 'Prompt with "I\'d like to change my appointment" if needed. Keep the scenario realistic and simple.',
    },
    'Questions Game': {
      prompt:     'I will ask you a question about your daily life. Answer with two or three sentences and add one detail.',
      constraint: 'Keep questions grounded: routines, food, family, weekends. Prompt with "Can you tell me more about…?"',
    },
    'Hot Takes': {
      prompt:     'Do you think it is better to cook at home or eat in a restaurant? Tell me your opinion and one reason.',
      constraint: 'Use "I think… because…" and "For example,…" Focus on familiar everyday topics.',
    },
    'Problem Solving': {
      prompt:     'You forgot your wallet at home. You are already at the supermarket. What do you do?',
      constraint: 'Encourage "I could… or I could…" Keep the scenario realistic. Accept simple solutions.',
    },
    'Current Events': {
      prompt:     'Tell me about something that happened recently — in your town, your school, or your family.',
      constraint: 'Use past simple for events. Ask "What happened next?" to extend the answer naturally.',
    },
    'Presentation': {
      prompt:     'Tell me about a place you know well — your neighbourhood, your school, or a place you visit often.',
      constraint: 'Use "There is / There are…" and "I like it because…" Three or four sentences is a good target.',
    },
    'Pronunciation': {
      prompt:     'Say this word or phrase. Now make two sentences using it — one about yourself and one about someone you know.',
      constraint: 'Focus on word stress. Praise accuracy. Model the correct form and ask the student to try again.',
    },
  };

  // ── Beginner fallback simplifier ─────────
  // Used when a prompt's category has no entry in the A1/A2 override tables.
  // Strips advanced clauses from the original prompt text and replaces them
  // with a short, concrete instruction the student can act on immediately.

  const ADVANCED_PATTERNS = [
    /[^.]*\bexplain\b[^.]*/gi,
    /[^.]*\bgive your (opinion|view|reasons?)\b[^.]*/gi,
    /[^.]*\bwhy do you think\b[^.]*/gi,
    /[^.]*\buse an example\b[^.]*/gi,
    /[^.]*\bdiscuss\b[^.]*/gi,
    /[^.]*\bdebate\b[^.]*/gi,
    /[^.]*\bboth sides\b[^.]*/gi,
    /[^.]*\bdetailed\b[^.]*/gi,
    /[^.]*\bprecise vocabulary\b[^.]*/gi,
    /[^.]*\bcomplex sentences\b[^.]*/gi,
    /[^.]*\bnuanced\b[^.]*/gi,
    /[^.]*\bcounterargument\b[^.]*/gi,
  ];

  function simplifyForBeginner(text) {
    let simplified = text;
    for (const pattern of ADVANCED_PATTERNS) {
      simplified = simplified.replace(pattern, '');
    }
    simplified = simplified
      .replace(/\s{2,}/g, ' ')
      .replace(/([.?!])\s*[.?!]+/g, '$1')
      .trim();
    if (!simplified || simplified.length < 10) {
      simplified = 'Tell me about this topic.';
    }
    return simplified;
  }

  // ── Level prompt extensions ───────────────
  // Appended to the existing prompt text for B1 and B2+.

  const B1_EXTENSION = 'Give your opinion and explain why. '
    + 'Use an example from your own experience if you can.';

  const B2_EXTENSION = 'Discuss both sides and give a detailed opinion. '
    + 'Try to use precise vocabulary and complex sentences.';

  const B1_CONSTRAINT = 'Encourage a full answer with opinions and examples. '
    + 'Ask a natural follow-up question. '
    + 'Introduce a slightly more challenging word if the student is ready.';

  const B2_CONSTRAINT = 'Push for detailed opinions and nuanced reasoning. '
    + 'Introduce abstract angles or counterarguments. '
    + 'Expect and encourage advanced vocabulary and complex sentence structures.';

  const A1_FALLBACK_CONSTRAINT = 'Very simple answers are fine. '
    + 'Use gestures or pictures to help. One or two words is enough to start.';

  const A2_FALLBACK_CONSTRAINT = 'Short sentences are fine. '
    + 'Help the student with any vocabulary they need. Keep it encouraging.';

  /**
   * Returns the prompt object adapted for the current level.
   *
   * A1/A2 — if a category override exists, use it (prompt + constraint replaced).
   *          if no override exists, simplify the original prompt text and apply
   *          a beginner-appropriate constraint. Never falls through to B1.
   * B1    — original prompt kept; B1 extension appended; B1 constraint set.
   * B2+   — original prompt kept; B2 extension appended; B2 constraint set.
   *
   * Defaults to B1 behaviour for any unrecognised level string.
   * Always preserves category and any other fields on the object.
   */
  function applyLevelAdaptation(p, level) {
    if (level === 'A1') {
      const override = A1_PROMPTS[p.category];
      if (override) return { ...p, prompt: override.prompt, constraint: override.constraint };
      return { ...p, prompt: simplifyForBeginner(p.prompt), constraint: A1_FALLBACK_CONSTRAINT };
    }
    if (level === 'A2') {
      const override = A2_PROMPTS[p.category];
      if (override) return { ...p, prompt: override.prompt, constraint: override.constraint };
      return { ...p, prompt: simplifyForBeginner(p.prompt), constraint: A2_FALLBACK_CONSTRAINT };
    }
    if (level === 'B2' || level === 'B2+' || level === 'C1' || level === 'C2') {
      return { ...p, prompt: p.prompt + ' ' + B2_EXTENSION, constraint: B2_CONSTRAINT };
    }
    // B1, B1/B2, or any unrecognised level -> Intermediate
    return { ...p, prompt: p.prompt + ' ' + B1_EXTENSION, constraint: B1_CONSTRAINT };
  }

  // ── Public API ────────────────────────────
  return {

    /**
     * Fetch and initialise prompt data.
     * Returns a Promise that resolves with the full prompts array.
     */
    load(url = 'data/prompts.json') {
      return fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} — could not load ${url}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error('prompts.json is empty or not a JSON array');
          }
          prompts = data;
          return prompts;
        });
    },

    /**
     * Prime the bag (call after load, and when filter changes).
     * categoryFilter: string or '' for all.
     * levelFilter: 'A1' | 'A2' | 'B1' | 'B1/B2' | 'B2' — stored for draw().
     */
    prime(categoryFilter = '', levelFilter = 'B1') {
      currentLevel = levelFilter;
      bag = [];
      refillBag(categoryFilter);
    },

    /**
     * Draw the next prompt object.
     * Automatically refills the bag when exhausted.
     * Applies level adaptation for A1/A2 before returning.
     */
    draw(categoryFilter = '', levelFilter = 'B1') {
      currentLevel = levelFilter;
      if (bag.length === 0) refillBag(categoryFilter);
      shown++;
      return applyLevelAdaptation(prompts[bag.pop()], currentLevel);
    },

    /** Running count of prompts drawn this session. */
    getShown() {
      return shown;
    },

    /** Currently active level. */
    getLevel() {
      return currentLevel;
    },

    /** All unique category names from the loaded data. */
    getCategories() {
      return [...new Set(prompts.map(p => p.category))];
    },

  };

})();