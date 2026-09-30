// ─────────────────────────────────────────────
//  WaffleBrain — js/payment.js
//  Pro access (premium Collections) and the Stripe Checkout placeholder.
//  Loaded by index.html before app.js. Exposes one global: WaffleAccess.
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

  // ── CONFIGURATION — paste your values here later ────────────────────
  const CONFIG = {
    // Stripe → Developers → API keys → "Publishable key" (starts pk_live_
    // or pk_test_). Safe to put in front-end code. Never paste the SECRET
    // key (sk_…) anywhere in this repository.
    STRIPE_PUBLISHABLE_KEY: '',          // e.g. 'pk_test_51Abc…'

    // URL of YOUR backend endpoint that creates a Stripe Checkout Session
    // (Netlify / Vercel serverless function, Cloudflare Worker, …).
    // It receives a POST and must reply with JSON: { "url": "https://checkout.stripe.com/…" }
    // (or, for the older flow, { "sessionId": "cs_…" }). The secret key
    // lives only in that backend.
    CHECKOUT_SESSION_ENDPOINT: '',       // e.g. 'https://wafflebrain.netlify.app/.netlify/functions/create-checkout-session'

    // URL of YOUR backend endpoint that confirms a finished payment.
    // Stripe sends the buyer back to wafflebrain.com/?checkout=success&session_id=cs_…
    // (set success_url that way when creating the session). This page then
    // asks the endpoint { "paid": true } before unlocking. Without it, a
    // return from Stripe does NOT unlock anything.
    VERIFY_SESSION_ENDPOINT: '',         // e.g. 'https://…/verify-checkout-session'

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
      console.info('[WaffleBrain] Stripe is not configured yet: set CHECKOUT_SESSION_ENDPOINT in js/payment.js.');
      return 'Payments aren’t set up yet — please check back soon.';
    }
    try {
      // 1. Ask your backend to create a Checkout Session for the
      //    one-off "Lifetime Access" price.
      const res = await fetch(CONFIG.CHECKOUT_SESSION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'lifetime', returnUrl: location.origin + location.pathname }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 2a. Current Stripe flow: the backend returns the hosted Checkout URL.
      if (data.url) { location.href = data.url; return new Promise(() => {}); }

      // 2b. Older flow: the backend returns a session id; Stripe.js redirects.
      if (data.sessionId && CONFIG.STRIPE_PUBLISHABLE_KEY) {
        await loadStripeJs();
        const stripe = Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
        return new Promise(() => {});
      }
      throw new Error('Checkout endpoint returned neither url nor sessionId');
    } catch (err) {
      console.error('[WaffleBrain] Checkout failed:', err);
      return 'Sorry, checkout couldn’t start. Please try again in a moment.';
    }
  }

  // Loads https://js.stripe.com/v3/ only when it is actually needed.
  function loadStripeJs() {
    if (typeof Stripe !== 'undefined') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Could not load Stripe.js'));
      document.head.appendChild(s);
    });
  }

  // ── Return from Stripe ───────────────────────
  // ?checkout=success&session_id=cs_… → confirm with the backend, then
  // unlock. Resolves true if this browser was just unlocked.
  async function handleCheckoutReturn() {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') !== 'success') return false;
    const sessionId = params.get('session_id');
    if (!CONFIG.VERIFY_SESSION_ENDPOINT || !sessionId) {
      console.info('[WaffleBrain] Returned from checkout, but VERIFY_SESSION_ENDPOINT is not set — not unlocking.');
      return false;
    }
    try {
      const res = await fetch(`${CONFIG.VERIFY_SESSION_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`);
      const data = res.ok ? await res.json() : {};
      if (data.paid === true) { setProUnlocked(true); return true; }
    } catch (err) {
      console.error('[WaffleBrain] Could not verify checkout:', err);
    }
    return false;
  }

  applyDevToggle();

  return { isProUnlocked, setProUnlocked, handleStripeCheckout, handleCheckoutReturn };
})();

// The paywall button calls this name directly.
function handleStripeCheckout() {
  return WaffleAccess.handleStripeCheckout();
}
