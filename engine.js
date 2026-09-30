// ─────────────────────────────────────────────
//  WaffleBrain — engine.js
//  Shared Waffle engine. No DOM dependencies.
//  Exposes a single global: WB
//
//  Waffle selection is driven entirely by
//  data/waffles.json (the canonical Waffle data) —
//  no text rewriting, no fallback generation, no overrides.
// ─────────────────────────────────────────────

const WB = (() => {

  // ── Private state ─────────────────────────
  let all           = [];  // every Waffle record from waffles.json, in file order
  let byId          = new Map(); // id → Waffle record
  let waffles       = [];  // pool for the *current collection + level* (rebuilt on change)
  let poolKey       = null;// which collection|level `waffles` was built for
  let bag           = [];  // shuffle-bag (indices into `waffles`)
  let shown         = 0;   // running count of Waffles drawn this session
  let currentLevel  = 'B1';// stored for callers

  // ── Fisher-Yates shuffle ──────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── All Waffles for one collection + level ─
  function poolFor(collection, levelFilter) {
    const pool = all.filter(w => w.collection === collection && w.level === levelFilter);
    if (pool.length) return pool;

    // Level not found. This means the caller (UI) passed a level
    // string that doesn't exist in waffles.json — e.g. a mismatch
    // between a <select> option's value and the records' `level`
    // field. We deliberately do NOT fall back to combining every
    // level here: that fallback previously caused Waffles from
    // every level (including B2+) to leak into filters like A1/A2.
    // Fail loudly instead so mismatches are caught immediately.
    const validLevels = [...new Set(all.filter(w => w.collection === collection).map(w => w.level))].join(', ');
    throw new Error(
      `WB.draw/prime: unknown level "${levelFilter}" in collection "${collection}". ` +
      `Valid levels in waffles.json are: ${validLevels}. ` +
      `Check that the <select> option value and waffles.json level match exactly.`
    );
  }

  function ensurePool(levelFilter, collection) {
    const key = `${collection}|${levelFilter}`;
    if (poolKey !== key) {
      waffles = poolFor(collection, levelFilter);
      poolKey = key;
    }
  }

  // ── Build index pool from filter ──────────
  // Returns an array of indices into `waffles`
  // matching the given category (or all if empty).
  function buildPool(categoryFilter) {
    if (!categoryFilter) return [...Array(waffles.length).keys()];
    return waffles.reduce((acc, w, i) => {
      if (w.category === categoryFilter) acc.push(i);
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
     * Fetch and initialise Waffle data from JSON.
     * Returns a Promise that resolves with the array of Waffle records.
     *
     * The JSON must be an array of Waffle records:
     *   [ { id, collection, level, category,
     *       teacher: { prompt, constraint },
     *       student: { prompt, constraint } }, ... ]
     */
    load(url = 'data/waffles.json') {
      return fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} — could not load ${url}`);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error('waffles.json is empty or not a JSON array of Waffle records');
          }
          all = data;
          byId = new Map(data.map(w => [w.id, w]));
          poolKey = null; // force pool rebuild on next prime/draw
          return all;
        });
    },

    /**
     * Prime the shuffle-bag.
     * Call after load(), and whenever the category filter changes.
     *
     * categoryFilter — category string, or '' for all Waffles.
     * levelFilter    — selects which level pool Waffles are drawn from.
     * collection     — Collection id (default 'general').
     */
    prime(categoryFilter = '', levelFilter = 'B1', collection = 'general') {
      currentLevel = levelFilter;
      ensurePool(levelFilter, collection);
      bag = [];
      refillBag(categoryFilter);
    },

    /**
     * Draw the next Waffle record from the bag.
     * Automatically refills when the bag is exhausted.
     * Returns the Waffle record from JSON — no text modification.
     *
     * categoryFilter — category string, or '' for all Waffles.
     * levelFilter    — selects which level pool Waffles are drawn from.
     * collection     — Collection id (default 'general').
     */
    draw(categoryFilter = '', levelFilter = 'B1', collection = 'general') {
      const levelChanged = levelFilter !== currentLevel;
      currentLevel = levelFilter;
      ensurePool(levelFilter, collection);
      if (bag.length === 0 || levelChanged) refillBag(categoryFilter);
      shown++;
      return waffles[bag.pop()];
    },

    /** Look up one Waffle record by its permanent id (or undefined). */
    getById(id) {
      return byId.get(id);
    },

    /** Running count of Waffles drawn this session. */
    getShown() {
      return shown;
    },

    /** Currently stored level string. */
    getLevel() {
      return currentLevel;
    },

    /** All unique category names in one Collection, in file order. */
    getCollectionCategories(collection) {
      return [...new Set(all.filter(w => w.collection === collection).map(w => w.category))];
    },

    /** All unique category names in the current pool. */
    getCategories() {
      return [...new Set(waffles.map(w => w.category))];
    },

  };

})();
