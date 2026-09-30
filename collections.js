// ─────────────────────────────────────────────
//  WaffleBrain — collections.js
//  The ONE list of Collections. Read by:
//    • app.js      — the Teacher page's Collection menu
//    • student.js  — the Collection name in the Student page header
//    • js/payment.js / app.js — which Collections are premium (paywall)
//    • scripts/validate.js — the allowed `collection` values in waffles.json
//
//  A Collection is a group of Waffles (General English, IELTS, …).
//  `icon` is shown in the Collection menu and in the header badge on both
//  pages; the colours and pattern for each id are in style.css
//  (body[data-collection="…"]).
//  `id` must match the `collection` field in data/waffles.json.
//  `isPremium: true` marks a paid Collection: on the Teacher page it shows
//  a 🔒 and opens the paywall unless this browser has Pro access (see
//  js/payment.js). Every other Collection is free.
//  Unlocked Collections are selectable and draw their own Waffles; locked
//  Collections are inert (no modal yet — that's a later stage). Unlocked
//  entries must come before locked ones: the "Coming Soon" heading is
//  inserted before the first locked entry. Adding a future Collection
//  should mean adding an entry here, not touching the markup or render logic.
// ─────────────────────────────────────────────

const COLLECTIONS = [
  { id: 'general',            name: 'General English',   icon: '🧇', locked: false, comingSoon: false },
  { id: 'business',           name: 'Business English',  icon: '💼', locked: false, comingSoon: false },
  { id: 'kids',               name: 'Kids',              icon: '🧸', locked: false, comingSoon: false },
  { id: 'ielts',              name: 'IELTS',             icon: '🎓', locked: false, comingSoon: false, isPremium: true },
  { id: 'cambridge',          name: 'Cambridge',         icon: '🏛️', locked: false, comingSoon: false, isPremium: true },
  { id: 'travel',             name: 'Travel',            icon: '✈️', locked: false, comingSoon: false },
  { id: 'debate',             name: 'Debate',            icon: '⚖️', locked: false, comingSoon: false },
  { id: 'medical',            name: 'Medical',           icon: '🩺', locked: false, comingSoon: false, isPremium: true },
  { id: 'conversation-club',  name: 'Conversation Club', icon: '☕', locked: false, comingSoon: false },
];

// Lets scripts/validate.js (Node) read the same list.
if (typeof module !== 'undefined') module.exports = COLLECTIONS;
