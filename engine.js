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
  let raw           = {};  // full dataset after fetch: { level: { group: [prompts] } }
  let prompts       = [];  // flattened pool for the *current level* (rebuilt on level change)
  let poolLevel     = null;// which level `prompts` was flattened for
  let bag           = [];  // shuffle-bag (indices into filtered pool)
  let shown         = 0;   // running count of prompts drawn this session
  let currentLevel  = 'B1';// stored for callers

  // ── Fisher-Yates shuffle ──────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Flatten a level's groups into one array ─
  // raw[level] is { groupName: [promptObj, ...], ... }.
  // The group/topic key itself IS the category — prompt objects
  // do not carry their own `category` field in the JSON, so it is
  // injected here from the group key as each level is flattened.
  function flattenGroups(groups) {
    return Object.entries(groups).flatMap(([groupName, groupPrompts]) =>
      groupPrompts.map(p => ({ ...p, category: groupName }))
    );
  }

  function flattenLevel(levelFilter) {
    const levelData = raw[levelFilter];
    if (levelData) return flattenGroups(levelData);

    // Level not found. This means the caller (UI) passed a level
    // string that doesn't exist as a key in prompts.json — e.g. a
    // mismatch between a <select> option's value and the JSON's
    // top-level keys. We deliberately do NOT fall back to combining
    // every level here: that fallback previously caused prompts from
    // every level (including B2+) to leak into filters like A1/A2.
    // Fail loudly instead so mismatches are caught immediately.
    const validLevels = Object.keys(raw).join(', ');
    throw new Error(
      `WB.draw/prime: unknown level "${levelFilter}". ` +
      `Valid levels in prompts.json are: ${validLevels}. ` +
      `Check that the <select> option value and prompts.json key match exactly.`
    );
  }

  function ensurePool(levelFilter) {
    if (poolLevel !== levelFilter) {
      prompts = flattenLevel(levelFilter);
      poolLevel = levelFilter;
    }
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
     * Returns a Promise that resolves with the raw dataset.
     *
     * The JSON must be an object keyed by level, each level an
     * object keyed by group/category name, each group an array of
     * prompt objects with at minimum: { prompt, constraint }.
     * The group key itself is used as the category — it does not
     * need to be repeated inside each prompt object.
     *   { "A1A2": { "Everyday Situations": [ {prompt, constraint, ...} ] } }
     */
    load(url = 'data/prompts.json') {
      return fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} — could not load ${url}`);
          return res.json();
        })
        .then(data => {
          if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
            throw new Error('prompts.json is empty or not a JSON object keyed by level');
          }
          raw = data;
          poolLevel = null; // force pool rebuild on next prime/draw
          return raw;
        });
    },

    /**
     * Prime the shuffle-bag.
     * Call after load(), and whenever the category filter changes.
     *
     * categoryFilter — category string, or '' for all prompts.
     * levelFilter    — selects which level pool prompts are drawn from.
     */
    prime(categoryFilter = '', levelFilter = 'B1') {
      currentLevel = levelFilter;
      ensurePool(levelFilter);
      bag = [];
      refillBag(categoryFilter);
    },

    /**
     * Draw the next prompt object from the bag.
     * Automatically refills when the bag is exhausted.
     * Returns the raw prompt object from JSON — no text modification.
     *
     * categoryFilter — category string, or '' for all prompts.
     * levelFilter    — selects which level pool prompts are drawn from.
     */
    draw(categoryFilter = '', levelFilter = 'B1') {
      const levelChanged = levelFilter !== currentLevel;
      currentLevel = levelFilter;
      ensurePool(levelFilter);
      if (bag.length === 0 || levelChanged) refillBag(categoryFilter);
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
