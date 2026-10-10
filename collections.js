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
//  `categoryLabel` is the teacher-facing name for the `category` field of this
//  Collection's Waffles (Activity, Topic, Situation, Exam part…), shown beside
//  the category chips; the data field itself stays `category`.
//  `studentCategoryLabel` is the STUDENT page's name for the same field. It is
//  optional: the Student page says "Topic" unless this is set (IELTS "Part",
//  Cambridge "Task"). Kept apart from `categoryLabel` on purpose, so the
//  Teacher wording can change without touching the Student page.
//  `group` puts the Collection under a heading in the Teacher menu (see
//  COLLECTION_GROUPS below). Premium Collections are in the 'pro' group.
//  Unlocked Collections are selectable and draw their own Waffles; a
//  `locked: true` Collection is inert (none at present). Adding a future
//  Collection should mean adding an entry here, not touching the markup or
//  render logic.
// ─────────────────────────────────────────────

// The Teacher page's Collection menu shows these groups, in this order.
// A Collection's `group` must be one of these ids.
const COLLECTION_GROUPS = [
  { id: 'everyday', title: 'Everyday' },
  { id: 'pro',      title: 'Professional & Exam Prep' },
];

// Array order is menu order (within each group).
const COLLECTIONS = [
  { id: 'general',           name: 'General English',   icon: '🧇', group: 'everyday',  categoryLabel: 'Activity',  locked: false, comingSoon: false },
  { id: 'business',          name: 'Business English',  icon: '💼', group: 'everyday',  categoryLabel: 'Activity',  locked: false, comingSoon: false },
  { id: 'kids',              name: 'Kids',              icon: '🧸', group: 'everyday',  categoryLabel: 'Topic',     locked: false, comingSoon: false },
  { id: 'travel',            name: 'Travel',            icon: '✈️', group: 'everyday',  categoryLabel: 'Situation', locked: false, comingSoon: false },
  { id: 'debate',            name: 'Debate',            icon: '⚖️', group: 'everyday',  categoryLabel: 'Topic',     locked: false, comingSoon: false },
  { id: 'conversation-club', name: 'Conversation Club', icon: '☕', group: 'everyday',  categoryLabel: 'Topic',     locked: false, comingSoon: false },
  { id: 'medical',           name: 'Medical',           icon: '🩺', group: 'pro',       categoryLabel: 'Topic',     locked: false, comingSoon: false, isPremium: true },
  { id: 'ielts',             name: 'IELTS',             icon: '🎓', group: 'pro',       categoryLabel: 'Exam part', studentCategoryLabel: 'Part', locked: false, comingSoon: false, isPremium: true },
  { id: 'cambridge',         name: 'Cambridge',         icon: '🏛️', group: 'pro',       categoryLabel: 'Exam task', studentCategoryLabel: 'Task', locked: false, comingSoon: false, isPremium: true },
  { id: 'hospitality',       name: 'Hospitality',       icon: '🛎️', group: 'pro',       categoryLabel: 'Topic',     locked: false, comingSoon: false, isPremium: true },
];

// Lets scripts/validate.js (Node) read the same list.
if (typeof module !== 'undefined') module.exports = COLLECTIONS;
