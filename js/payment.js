// ─────────────────────────────────────────────
//  WaffleBrain — js/payment.js
//  Pro access (premium Collections) and Stripe Checkout.
//  Loaded by index.html before app.js. Exposes one global: WaffleAccess.
//
//  Checkout runs through two Netlify functions (netlify/functions/):
//    create-checkout  POST → { url }   (Stripe-hosted checkout page)
//    verify-checkout  GET ?session_id=… → { paid }
//  The Stripe SECRET key lives only in Netlify's environment variables;
//  nothing secret is in this file. These relative paths only work when the
//  site itself is deployed on Netlify.
//
//  ⚠ IMPORTANT — this is FRONT-END ONLY.
//  All Waffles, including the premium ones, are in data/waffles.json,
//  which anyone can download. The lock below only changes what the Teacher
//  page shows; it is not a security measure. Anyone can also unlock it with
//  ?pro=true (see "Developer Pro Access Toggle"). Before selling access for
//  real, premium Waffles need to be served by a backend that checks the
//  purchase, and the testing toggle should be switched off
//  (DEV_TOGGLE_ENABLED = false).
// ─────────────────────────────────────────────

const WaffleAccess = (() => {

  // ── CONFIGURATION (Netlify function paths; no keys belong here) ────────
  const CONFIG = {
    // Netlify function that creates a Stripe Checkout Session for the
    // "Lifetime Access" price and replies { "url": "https://checkout.stripe.com/…" }.
    // (The publishable key isn't needed: the page simply goes to that URL.)
    CHECKOUT_SESSION_ENDPOINT: '/.netlify/functions/create-checkout',

    // Netlify function that confirms a finished payment. Stripe sends the
    // buyer back to https://wafflebrain.com/?session_id=cs_… and this page
    // only unlocks once the function answers { "paid": true }.
    VERIFY_SESSION_ENDPOINT: '/.netlify/functions/verify-checkout',

    // Developer Pro Access Toggle (?pro=true / ?pro=false and the
    // localStorage key below). Switch to false before charging real money.
    DEV_TOGGLE_ENABLED: true,
  };

  // How long to wait for the checkout function before giving up.
  const CHECKOUT_TIMEOUT_MS = 20000;

  // localStorage key that marks this browser as Pro.
  const STORAGE_KEY = 'waffle_pro_unlocked';

  // ── Pro status ───────────────────────────────
  function read() {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch (e) { return false; }
  }

  function setProUnlocked(on) {
    try {
      if (on) localStorage.setItem(STORAGE_KEY, 'true');
      else    localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* storage unavailable — stays locked */ }
  }

  function isProUnlocked() {
    return read();
  }

  // ── Developer Pro Access Toggle ──────────────
  // For testing: open the site with ?pro=true to unlock the premium
  // Collections in this browser (remembered), and ?pro=false to lock them
  // again. The same flag can be set in the browser console:
  //   localStorage.setItem('waffle_pro_unlocked', 'true')   // unlock
  //   localStorage.removeItem('waffle_pro_unlocked')        // lock
  function applyDevToggle() {
    if (!CONFIG.DEV_TOGGLE_ENABLED) return;
    const pro = new URLSearchParams(location.search).get('pro');
    if (pro === 'true')  setProUnlocked(true);
    if (pro === 'false') setProUnlocked(false);
  }

  // ── Stripe Checkout ──────────────────────────
  // Called by the paywall's "Unlock Lifetime Access" button. Returns a
  // Promise that resolves to a short message to show the teacher if the
  // redirect could not happen (e.g. payments not set up yet), or never
  // resolves because the browser has left for Stripe.
  async function handleStripeCheckout() {
    if (!CONFIG.CHECKOUT_SESSION_ENDPOINT) {
      return 'Payments aren\u2019t set up yet \u2014 please check back soon.';
    }
    const TRY_AGAIN = 'Sorry, checkout couldn\u2019t start. Please try again in a moment.';
    const fail = (detail, message = TRY_AGAIN) => {
      // Details for whoever is fixing it (browser console, F12); the teacher
      // only sees the short message.
      console.error(`[WaffleBrain] Checkout failed: ${detail}`);
      return message;
    };

    // 1. Ask the Netlify function to create a Checkout Session.
    let res;
    const timer = new AbortController();
    const timeout = setTimeout(() => timer.abort(), CHECKOUT_TIMEOUT_MS);
    try {
      res = await fetch(CONFIG.CHECKOUT_SESSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: timer.signal,
      });
    } catch (err) {
      return fail(err && err.name === 'AbortError'
        ? `no answer from ${CONFIG.CHECKOUT_SESSION_ENDPOINT} after ${CHECKOUT_TIMEOUT_MS / 1000}s.`
        : `could not reach ${CONFIG.CHECKOUT_SESSION_ENDPOINT} (offline or blocked): ${err}`,
        'Couldn\u2019t reach checkout. Please check your connection and try again.');
    } finally {
      clearTimeout(timeout);
    }

    const text = await res.text().catch(() => '');
    let data = null;
    try { data = JSON.parse(text); } catch (e) { /* not JSON — handled below */ }

    if (res.status === 404 || res.status === 405) {
      return fail(`${CONFIG.CHECKOUT_SESSION_ENDPOINT} answered HTTP ${res.status}. ` +
        'The checkout function is not running on this host: either the site is not ' +
        'served by Netlify (e.g. still GitHub Pages), or the latest Netlify deploy has ' +
        'no "create-checkout" function (check Netlify \u2192 Logs \u2192 Functions and the deploy log).');
    }
    if (!res.ok) {
      const why = data && data.error ? `"${data.error}"` : 'no JSON error message';
      const code = data && data.code ? ` (code: ${data.code})` : '';
      const hint = data && data.code === 'not_configured'
        ? ' Set STRIPE_SECRET_KEY and PRICE_ID in Netlify \u2192 Site configuration \u2192 Environment variables, then redeploy.'
        : ' See Netlify \u2192 Logs \u2192 Functions \u2192 create-checkout for the Stripe error.';
      return fail(`${CONFIG.CHECKOUT_SESSION_ENDPOINT} answered HTTP ${res.status}: ${why}${code}.${hint}`,
        data && data.code === 'not_configured'
          ? 'Payments aren\u2019t set up yet \u2014 please check back soon.'
          : TRY_AGAIN);
    }
    if (!data) {
      return fail(`${CONFIG.CHECKOUT_SESSION_ENDPOINT} answered HTTP ${res.status} but not with JSON ` +
        `(got: ${JSON.stringify(text.slice(0, 120))}). Something other than the Netlify function answered.`);
    }

    // 2. Go to the Stripe-hosted checkout page (only ever a Stripe URL).
    if (!isStripeCheckoutUrl(data.url)) {
      return fail(`${CONFIG.CHECKOUT_SESSION_ENDPOINT} did not return a Stripe Checkout URL ` +
        `(url: ${JSON.stringify(data.url)}).`);
    }
    window.location.href = data.url;
    return new Promise(() => {});   // the browser is leaving for Stripe
  }

  // Stripe Checkout pages are https://checkout.stripe.com/… (or another
  // stripe.com address). Anything else is refused so this button can never
  // send a teacher to a different site.
  function isStripeCheckoutUrl(value) {
    if (typeof value !== 'string') return false;
    let url;
    try { url = new URL(value); } catch (e) { return false; }
    return url.protocol === 'https:' &&
      (url.hostname === 'stripe.com' || url.hostname.endsWith('.stripe.com'));
  }

  // ── Return from Stripe ───────────────────────
  // https://wafflebrain.com/?session_id=cs_… → confirm with the Netlify
  // function, then unlock. The session_id is then removed from the address
  // bar (so a reload or a shared link doesn't re-check it). Resolves true
  // if this browser was just unlocked.
  async function handleCheckoutReturn() {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (!sessionId || !CONFIG.VERIFY_SESSION_ENDPOINT) return false;
    let unlocked = false;
    try {
      const res = await fetch(`${CONFIG.VERIFY_SESSION_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`);
      const data = res.ok ? await res.json() : {};
      if (data.paid === true) { setProUnlocked(true); unlocked = true; }
    } catch (err) {
      console.error('[WaffleBrain] Could not verify checkout:', err);
    }
    params.delete('session_id');
    const rest = params.toString();
    // window.history: app.js has its own global `history` (the Back list).
    window.history.replaceState(null, '', location.pathname + (rest ? `?${rest}` : '') + location.hash);
    return unlocked;
  }

  applyDevToggle();

  return { isProUnlocked, setProUnlocked, handleStripeCheckout, handleCheckoutReturn };
})();

// The paywall button calls this name directly.
function handleStripeCheckout() {
  return WaffleAccess.handleStripeCheckout();
}
