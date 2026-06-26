// ─────────────────────────────────────────────
//  WaffleBrain — engine.js
//  Shared prompt engine. No DOM dependencies.
//  Exposes a single global: WB
// ─────────────────────────────────────────────

const WB = (() => {

  // ── Private state ─────────────────────────
  let prompts  = [];   // full dataset after fetch
  let bag      = [];   // shuffle-bag (indices)
  let shown    = 0;    // running count

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
     */
    prime(categoryFilter = '') {
      bag = [];
      refillBag(categoryFilter);
    },

    /**
     * Draw the next prompt object.
     * Automatically refills the bag when exhausted.
     * categoryFilter is passed through so refill stays in sync.
     */
    draw(categoryFilter = '') {
      if (bag.length === 0) refillBag(categoryFilter);
      shown++;
      return prompts[bag.pop()];
    },

    /** Running count of prompts drawn this session. */
    getShown() {
      return shown;
    },

    /** All unique category names from the loaded data. */
    getCategories() {
      return [...new Set(prompts.map(p => p.category))];
    },

  };

})();