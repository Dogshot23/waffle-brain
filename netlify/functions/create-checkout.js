// ─────────────────────────────────────────────
//  WaffleBrain — netlify/functions/create-checkout.js
//  POST /.netlify/functions/create-checkout
//  Creates a Stripe Checkout Session for "WaffleBrain Pro — Lifetime
//  Access" and returns { url } for js/payment.js to redirect to.
//
//  Needs these Netlify environment variables (never commit them):
//    STRIPE_SECRET_KEY  sk_live_… / sk_test_… — server-side only
//    PRICE_ID           price_…  the one-off Lifetime Access price in Stripe
// ─────────────────────────────────────────────

const Stripe = require('stripe');

const SUCCESS_URL = 'https://wafflebrain.com/?session_id={CHECKOUT_SESSION_ID}';
const CANCEL_URL  = 'https://wafflebrain.com/';

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });
  }

  const { STRIPE_SECRET_KEY, PRICE_ID } = process.env;
  if (!STRIPE_SECRET_KEY || !PRICE_ID) {
    console.error('[create-checkout] STRIPE_SECRET_KEY or PRICE_ID is not set.');
    return json(500, { error: 'Payments are not configured yet.', code: 'not_configured' });
  }

  try {
    const stripe = Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
    });
    if (!session || !session.url) {
      console.error('[create-checkout] Stripe created session', session && session.id, 'but returned no url.');
      return json(502, { error: 'Stripe did not return a checkout page.', code: 'no_checkout_url' });
    }
    return json(200, { url: session.url });
  } catch (err) {
    // Log the detail for you (Netlify → Functions → Logs); never send the
    // message to the browser. Common causes: a test-mode PRICE_ID with a
    // live key (or the other way round) → resource_missing; a monthly/yearly
    // (recurring) price → this one-off "payment" checkout refuses it; a
    // rolled or mistyped key → authentication error.
    console.error('[create-checkout] Stripe error:',
      err && err.type, err && err.code, err && err.param, '-', err && err.message);
    // Stripe's short error type/code (e.g. "resource_missing") is safe to
    // pass on and helps tell these apart in the browser console.
    const code = (err && (err.code || err.type)) || 'stripe_error';
    return json(500, { error: 'Could not start checkout. Please try again.', code: String(code) });
  }
};
