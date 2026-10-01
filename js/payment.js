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
    try {
      // 1. Ask the Netlify function to create a Checkout Session.
      const res = await fetch(CONFIG.CHECKOUT_SESSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // 2. Go to the Stripe-hosted checkout page (only ever a Stripe URL).
      if (typeof data.url === 'string' && data.url.startsWith('https://checkout.stripe.com/')) {
        window.location.href = data.url;
        return new Promise(() => {});   // the browser is leaving for Stripe
      }
      throw new Error('Checkout function did not return a Stripe Checkout URL');
    } catch (err) {
      console.error('[WaffleBrain] Checkout failed:', err);
      return 'Sorry, checkout couldn\u2019t start. Please try again in a moment.';
    }
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
