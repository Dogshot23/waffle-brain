// ─────────────────────────────────────────────
//  WaffleBrain — engine.js
//  Shared prompt engine. No DOM dependencies.
//  Exposes a single global: WB
//
//  Prompt selection is driven entirely by
//  data/prompts.json — no text rewriting,
//  no fallback generation, no overrides.
// ─────────────────────────────────────────────

const WB = (() => {

  // ── Private state ─────────────────────────
  let prompts      = [];   // full dataset after fetch (flat array)
  let bag          = [];   // shuffle-bag (indices into filtered pool)
  let shown        = 0;    // running count of prompts drawn this session
  let currentLevel = 'B1'; // stored for callers; not used to filter prompts

  // ── Fisher-Yates shuffle ──────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Build index pool from filter ──────────
  // Returns an array of indices into `prompts`
  // matching the given category (or all if empty).
  function buildPool(categoryFilter) {
    if (!categoryFilter) return [...Array(prompts.length).keys()];
    return prompts.reduce((acc, p, i) => {
      if (p.category === categoryFilter) acc.push(i);
      return acc;
    }, []);
  }

  // ── Rebuild shuffle-bag ───────────────────
  function refillBag(categoryFilter) {
    bag = shuffle(buildPool(categoryFilter));
  }

  // ── Public API ────────────────────────────
  return {

    /**
     * Fetch and initialise prompt data from JSON.
     * Returns a Promise that resolves with the full prompts array.
     *
     * The JSON must be a flat array of objects, each with at minimum:
     *   { category, prompt, constraint }
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
     * Prime the shuffle-bag.
     * Call after load(), and whenever the category filter changes.
     *
     * categoryFilter — category string, or '' for all prompts.
     * levelFilter    — stored as currentLevel; not used to filter prompts.
     */
    prime(categoryFilter = '', levelFilter = 'B1') {
      currentLevel = levelFilter;
      bag = [];
      refillBag(categoryFilter);
    },

    /**
     * Draw the next prompt object from the bag.
     * Automatically refills when the bag is exhausted.
     * Returns the raw prompt object from JSON — no text modification.
     *
     * categoryFilter — category string, or '' for all prompts.
     * levelFilter    — stored as currentLevel; not used to filter prompts.
     */
    draw(categoryFilter = '', levelFilter = 'B1') {
      currentLevel = levelFilter;
      if (bag.length === 0) refillBag(categoryFilter);
      shown++;
      return { ...prompts[bag.pop()] };
    },

    /** Running count of prompts drawn this session. */
    getShown() {
      return shown;
    },

    /** Currently stored level string. */
    getLevel() {
      return currentLevel;
    },

    /** All unique category names from the loaded data. */
    getCategories() {
      return [...new Set(prompts.map(p => p.category))];
    },

  };

})();
