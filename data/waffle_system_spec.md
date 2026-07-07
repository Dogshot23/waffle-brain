# WaffleBrain Menu System Specification (Version 2) ## Background WaffleBrain is evolving from a single prompt generator into a platform containing multiple specialist prompt collections. Previously, users only selected: * English level * Prompt category The new system introduces a second layer called **Waffles**. A Waffle is a complete specialist prompt collection with its own prompts and, in the future, its own filters and behaviour. Examples include: * General English * IELTS * Kids * Business * Travel * Cambridge The General English Waffle is free. All other Waffles are currently locked and marked as **Coming Soon**. The goal is to introduce these future products without changing the overall simplicity of the interface. --- # Design philosophy The interface should still feel like: Open app ↓ Choose Waffle ↓ Choose level ↓ Choose category ↓ Get prompt Nothing else should feel more complicated. Avoid adding dashboards, home screens or unnecessary pages. --- # New dropdown A new dropdown should appear to the **left** of the existing Level dropdown. Desktop layout:
[ General English ▼ ]

[ Intermediate (B1) ▼ ]

[ All Categories ▼ ]
The new dropdown is the first thing users choose. It controls which Waffle they are using. --- # Dropdown contents The dropdown should contain:
🧇 General English

──────────────

COMING SOON

🔒 IELTS

🔒 Kids

🔒 Business

🔒 Cambridge

🔒 Travel

🔒 Debate

🔒 Medical

🔒 Conversation Club
The separator should visually distinguish the free Waffle from the upcoming premium Waffles. The "Coming Soon" heading should be small and subtle. --- # Locked behaviour Only **General English** is selectable. All other items: * appear greyed out * show a lock icon * show "Coming Soon" Clicking a locked item should **not** navigate anywhere. Instead it should open a very small modal or tooltip saying something like:
IELTS Waffle

Coming Soon

This specialist Waffle is currently being built.

It will include IELTS-specific speaking prompts and exam focused activities.

[Close]
Do NOT include pricing. Do NOT include subscriptions. Do NOT include payment buttons. The goal is simply to let users know more Waffles are coming. --- # Current functionality Changing between Waffles should not yet exist. Selecting General English simply keeps the app behaving exactly as it currently does. Nothing about prompt generation should change. The new dropdown is currently only laying the foundations for future expansion. --- # Future architecture Each Waffle should eventually become its own prompt database. For example:
General English

Levels

Categories

Prompts
IELTS

Own levels

Own categories

Own prompts
Business

Own filters

Own prompts
The menu should therefore be built in a way that makes it easy to add future Waffles without redesigning the interface. Adding a new Waffle should ideally mean adding another object to a data structure rather than rewriting the UI. --- # Future Waffles These are planned. General English (Free) IELTS Kids Business Cambridge Travel Debate Medical Conversation Club Additional Waffles may be added later. The menu should scale naturally to twenty or more Waffles. --- # Mobile behaviour Desktop may use a normal dropdown. On mobile the interface should remain clean and touch friendly. If necessary, the Waffle selector may become a full width dropdown above the Level selector. For example:
General English ▼

Intermediate ▼

All Categories ▼
Avoid trying to fit three dropdowns on one row on mobile. --- # Branding Throughout the app these specialist collections should be referred to as **Waffles**. Examples: "Unlock the IELTS Waffle" "Business Waffle" "Travel Waffle" "Waffles Coming Soon" The term "Route" has been abandoned. Do not refer to these as: * Collections * Libraries * Packs * Modules The branding language should consistently use **Waffle**. --- # Visual direction Eventually each Waffle will have its own icon. The icon system will use a single flat vector waffle pattern. Each icon is simply that waffle pattern cut into a recognisable silhouette. Examples: 🧇 General English ✈️ Travel Waffle 🎓 IELTS Waffle 💼 Business Waffle 😊 Kids Waffle 🏥 Medical Waffle 🏛 Cambridge Waffle All icons should feel like they belong to the same family by sharing the identical waffle grid pattern. --- # Technical goal Please build this menu with future expansion in mind. Avoid hard coding menu items into the JSX. Instead create a simple array or configuration object similar to:
javascript
[
  {
    id: "general",
    name: "General English",
    locked: false,
    comingSoon: false
  },
  {
    id: "ielts",
    name: "IELTS",
    locked: true,
    comingSoon: true
  },
  {
    id: "business",
    name: "Business",
    locked: true,
    comingSoon: true
  }
]
The UI should render directly from this data. In the future, unlocking a Waffle should simply require changing one property rather than rewriting components. --- # Overall objective This update is **not** about selling premium features yet. It is about introducing the idea that WaffleBrain is a growing ecosystem of specialist Waffles while keeping the interface almost identical to today's simple MVP. The user should immediately understand: > "I'm currently using the free General English Waffle, and more specialist Waffles are on the way." That is the only new concept this interface needs to communicate.