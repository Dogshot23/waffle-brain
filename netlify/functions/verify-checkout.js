// ─────────────────────────────────────────────
//  WaffleBrain — netlify/functions/verify-checkout.js
//  GET /.netlify/functions/verify-checkout?session_id=cs_…
//  Stripe sends the buyer back to wafflebrain.com/?session_id=cs_…; the page
//  asks this function whether that Checkout Session was really paid before
//  unlocking Pro, so the return link alone can't unlock anything.
//  Answers { paid: true } or { paid: false }.
//
//  Needs: STRIPE_SECRET_KEY (and PRICE_ID, to check it's the Pro purchase).
// ─────────────────────────────────────────────

const Stripe = require('stripe');

const json = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' }, { Allow: 'GET' });
  }

  const sessionId = (event.queryStringParameters || {}).session_id || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return json(400, { paid: false, error: 'Invalid session id.' });
  }

  const { STRIPE_SECRET_KEY, PRICE_ID } = process.env;
  if (!STRIPE_SECRET_KEY) {
    console.error('[verify-checkout] STRIPE_SECRET_KEY is not set.');
    return json(500, { paid: false, error: 'Payments are not configured yet.' });
  }

  try {
    const stripe = Stripe(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    const rightProduct = !PRICE_ID ||
      ((session.line_items && session.line_items.data) || []).some(item => item.price && item.price.id === PRICE_ID);
    const paid = session.mode === 'payment' && session.payment_status === 'paid' && rightProduct;
    return json(200, { paid });
  } catch (err) {
    console.error('[verify-checkout] Stripe error:', err && err.message);
    return json(200, { paid: false });
  }
};
