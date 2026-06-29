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
      prompt:     'Look at this picture. What do you see? Tell me three things.',
      constraint: 'Use "I can see…" and simple nouns. Present simple only.',
    },
    'Debate': {
      prompt:     'Do you like this? Yes or no? Why?',
      constraint: 'Use "I like…" or "I don\'t like…" + one simple reason.',
    },
    'Storytelling': {
      prompt:     'Look at the picture. What is happening? Tell me the story in three sentences.',
      constraint: 'Use "First… Then… After that…" Present simple or past simple.',
    },
    'Role Play': {
      prompt:     'You are in a shop. You want to buy something. What do you say?',
      constraint: 'Use "Can I have…?", "How much is…?", "Thank you." Simple shopping phrases.',
    },
    'Questions Game': {
      prompt:     'Answer my question with a full sentence. Then ask me one question back.',
      constraint: 'Full sentences only. Use "I…" to start your answer.',
    },
    'Hot Takes': {
      prompt:     'Is this good or bad? Tell me what you think.',
      constraint: 'Use "I think… because…" Keep it to one or two sentences.',
    },
    'Problem Solving': {
      prompt:     'There is a problem. What do you do first? What do you do next?',
      constraint: 'Use "First I… Then I…" Simple present. Everyday vocabulary only.',
    },
    'Current Events': {
      prompt:     'Tell me something you know about this topic. Use simple words.',
      constraint: 'Three sentences maximum. Simple present or past simple.',
    },
    'Presentation': {
      prompt:     'Tell me about your favourite thing. What is it? Why do you like it?',
      constraint: 'Use "My favourite… is…" Say three things about it.',
    },
    'Pronunciation': {
      prompt:     'Repeat this word or sentence after me. Then use it in your own sentence.',
      constraint: 'Focus on clear sounds. One sentence is enough.',
    },
  };

  const A2_PROMPTS = {
    'Picture Description': {
      prompt:     'Describe this picture. Where are the people? What are they doing? How do they feel?',
      constraint: 'Use present continuous for actions. Add one opinion: "I think…"',
    },
    'Debate': {
      prompt:     'Do you agree or disagree? Give two reasons for your opinion.',
      constraint: 'Use "I agree/disagree because…" and "Also,…" for your second reason.',
    },
    'Storytelling': {
      prompt:     'Tell me the story in this picture. What happened before? What happens next?',
      constraint: 'Use past simple for events. "First… Then… Finally…" structure.',
    },
    'Role Play': {
      prompt:     'You need help in this situation. Start the conversation and solve the problem.',
      constraint: 'Use polite requests: "Could you…?", "I\'d like to…", "Is it possible to…?"',
    },
    'Questions Game': {
      prompt:     'Answer my question with two or three sentences. Include a detail or example.',
      constraint: 'Avoid yes/no answers. Add "for example…" or "like…" to extend.',
    },
    'Hot Takes': {
      prompt:     'What is your opinion on this? Do you think it is a good or bad idea? Why?',
      constraint: 'Use "I think… because…" Give one example from everyday life.',
    },
    'Problem Solving': {
      prompt:     'What is the problem here? What are two things you could do to fix it?',
      constraint: 'Use "I could… or I could…" Explain which option you prefer and why.',
    },
    'Current Events': {
      prompt:     'What do you know about this topic? How does it affect people?',
      constraint: 'Use simple present for facts. "This affects people because…"',
    },
    'Presentation': {
      prompt:     'Tell me about this topic for one minute. Include what it is, why it matters, and your opinion.',
      constraint: 'Use "First… Also… In my opinion…" to organise your talk.',
    },
    'Pronunciation': {
      prompt:     'Say this word or phrase. Now use it in two different sentences.',
      constraint: 'Focus on word stress. Check the vowel sounds.',
    },
  };

  // ── Level-specific constraint guidance ────
  // Applied as a constraint overlay for B1 and B2+ levels.
  // Prompt text is left untouched; only the constraint field is set.
  // Defaults to B1 if level is unrecognised.

  const B1_CONSTRAINT = 'Encourage a full answer with opinions and examples. '
    + 'Ask a natural follow-up question. '
    + 'Introduce a slightly more challenging word if the student is ready.';

  const B2_CONSTRAINT = 'Push for detailed opinions and nuanced reasoning. '
    + 'Introduce abstract angles or counterarguments. '
    + 'Expect and encourage advanced vocabulary and complex sentence structures.';

  /**
   * Returns the prompt object adapted for the current level.
   * For A1/A2: swaps prompt + constraint using the tables above.
   * For B1: keeps original prompt, overlays B1 constraint guidance.
   * For B2/B2+: keeps original prompt, overlays B2+ constraint guidance.
   * Defaults to B1 behaviour if level is unrecognised.
   * Always preserves category and any other fields on the object.
   */
  function applyLevelAdaptation(p, level) {
    if (level === 'A1') {
      const override = A1_PROMPTS[p.category];
      if (override) return { ...p, prompt: override.prompt, constraint: override.constraint };
    }
    if (level === 'A2') {
      const override = A2_PROMPTS[p.category];
      if (override) return { ...p, prompt: override.prompt, constraint: override.constraint };
    }
    if (level === 'B2' || level === 'B2+' || level === 'C1' || level === 'C2') {
      return { ...p, constraint: B2_CONSTRAINT };
    }
    // B1, B1/B2, or any unrecognised level → Intermediate behaviour
    return { ...p, constraint: B1_CONSTRAINT };
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