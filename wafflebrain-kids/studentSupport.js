// ─────────────────────────────────────────────
//  WaffleBrain — studentSupport.js
//  Student-facing scaffolding: 30 standalone Waffles.
//
//  SCHEMA:
//  WAFFLES = [
//    {
//      waffle:   string    // a short, self-contained speaking mission —
//                          // something to DO in the conversation with
//                          // the teacher, not a language point.
//      goal:     string    // one short sentence: why this Waffle matters.
//      starters: string[]  // exactly 3 ready-to-use conversation starters —
//                          // the 💬 Waffle Starters box. Always visible,
//                          // never collapsible.
//    },
//    ...
//  ]
//
//  Waffles are level-agnostic and category-agnostic: every entry is
//  written for a roughly B1 student but flexes naturally for stronger
//  or weaker learners. No pictures, worksheets, or external materials
//  are required — each Waffle works from the words on the page alone.
//
//  This file is intentionally separate from prompts.json.
//  Support content is not tied to any one prompt.
// ─────────────────────────────────────────────

const WAFFLES = [
  {
    waffle: "Ask your teacher about a holiday they really enjoyed.",
    goal: "Find out three reasons it was so memorable.",
    starters: [
      "Can you tell me about...?",
      "What made it special?",
      "What happened next?"
    ]
  },
  {
    waffle: "Tell your teacher about a place you love visiting.",
    goal: "See if your teacher knows somewhere similar.",
    starters: [
      "One place I really like is...",
      "Have you ever been somewhere like that?",
      "What do you like about it?"
    ]
  },
  {
    waffle: "Ask your teacher about something they enjoy doing at weekends.",
    goal: "Keep the conversation going until you learn three new things.",
    starters: [
      "What do you usually...?",
      "Why do you enjoy it?",
      "What do you do after that?"
    ]
  },
  {
    waffle: "Tell your teacher about your favourite food.",
    goal: "Find one food you both enjoy.",
    starters: [
      "One of my favourites is...",
      "What about you?",
      "Why do you like it?"
    ]
  },
  {
    waffle: "Ask your teacher about a skill they would like to learn.",
    goal: "Find out what makes that skill interesting.",
    starters: [
      "Is there anything you'd like to learn?",
      "Why that?",
      "How would you start?"
    ]
  },
  {
    waffle: "Tell your teacher about a film or series you enjoyed.",
    goal: "Find out whether they would enjoy it too.",
    starters: [
      "Have you seen...?",
      "It's about...",
      "I think you'd like it because..."
    ]
  },
  {
    waffle: "Ask your teacher about a country they would like to visit.",
    goal: "Find out what they would do there.",
    starters: [
      "Where would you like to go?",
      "Why there?",
      "What would you do first?"
    ]
  },
  {
    waffle: "Tell your teacher about someone you admire.",
    goal: "Find out who they admire and why.",
    starters: [
      "I really admire...",
      "What about you?",
      "What makes that person special?"
    ]
  },
  {
    waffle: "Ask your teacher about something that made them laugh recently.",
    goal: "Find out the whole story.",
    starters: [
      "What happened?",
      "Who was there?",
      "Why was it so funny?"
    ]
  },
  {
    waffle: "Tell your teacher about something you're looking forward to.",
    goal: "Find out what they're excited about too.",
    starters: [
      "I'm really looking forward to...",
      "What about you?",
      "Why are you excited about it?"
    ]
  },
  {
    waffle: "Ask your teacher about a memorable teacher they had.",
    goal: "Find out what made that person unforgettable.",
    starters: [
      "Can you tell me about...?",
      "What made them special?",
      "What did you learn from them?"
    ]
  },
  {
    waffle: "Tell your teacher about a difficult decision you had to make.",
    goal: "Find out whether they would have made the same choice.",
    starters: [
      "I had to decide whether...",
      "What would you have done?",
      "Why do you think that?"
    ]
  },
  {
    waffle: "Ask your teacher about a hobby they used to have.",
    goal: "Find out why they stopped doing it.",
    starters: [
      "Did you ever use to...?",
      "Why did you stop?",
      "Would you do it again?"
    ]
  },
  {
    waffle: "Tell your teacher about something you're proud of.",
    goal: "Explain why it matters to you.",
    starters: [
      "I'm quite proud of...",
      "It wasn't easy because...",
      "What do you think?"
    ]
  },
  {
    waffle: "Ask your teacher about the best meal they've ever eaten.",
    goal: "Find out what made it so memorable.",
    starters: [
      "Where was it?",
      "What made it so good?",
      "Would you go back?"
    ]
  },
  {
    waffle: "Tell your teacher about a place in your town that visitors should see.",
    goal: "Convince them that it's worth visiting.",
    starters: [
      "If you came to my town...",
      "I'd definitely recommend...",
      "The best thing about it is..."
    ]
  },
  {
    waffle: "Ask your teacher about a childhood memory.",
    goal: "Find out why they still remember it today.",
    starters: [
      "What happened?",
      "How old were you?",
      "Why do you still remember it?"
    ]
  },
  {
    waffle: "Tell your teacher about something you've changed your mind about.",
    goal: "Explain what caused you to change your opinion.",
    starters: [
      "I used to think...",
      "Then I realised...",
      "Now I think..."
    ]
  },
  {
    waffle: "Ask your teacher about something they'd like to improve.",
    goal: "Find out how they plan to improve it.",
    starters: [
      "What would you like to get better at?",
      "Why that?",
      "How will you do it?"
    ]
  },
  {
    waffle: "Tell your teacher about a tradition you enjoy.",
    goal: "Find out whether they have something similar.",
    starters: [
      "Every year I...",
      "Do you have anything similar?",
      "What's your favourite tradition?"
    ]
  },
  {
    waffle: "Ask your teacher about something they hope to do in the next five years.",
    goal: "Find out why it's important to them.",
    starters: [
      "What's something you'd really like to...?",
      "Why is that important?",
      "When would you like to do it?"
    ]
  },
  {
    waffle: "Tell your teacher about one thing you'd change in your town.",
    goal: "See if your teacher agrees with your idea.",
    starters: [
      "I'd change...",
      "What do you think?",
      "Would that improve things?"
    ]
  },
  {
    waffle: "Ask your teacher about a useful piece of advice they've received.",
    goal: "Find out whether it's still useful today.",
    starters: [
      "Who gave you the advice?",
      "Why do you remember it?",
      "Has it helped you?"
    ]
  },
  {
    waffle: "Tell your teacher about your ideal weekend.",
    goal: "Compare your perfect weekends.",
    starters: [
      "Ideally I'd...",
      "What about you?",
      "Why does that sound perfect?"
    ]
  },
  {
    waffle: "Ask your teacher about a time something didn't go as planned.",
    goal: "Find out how they solved the problem.",
    starters: [
      "What happened?",
      "How did you deal with it?",
      "What did you learn?"
    ]
  },
  {
    waffle: "Tell your teacher about a small achievement that made you happy.",
    goal: "Explain why it mattered to you.",
    starters: [
      "Recently I managed to...",
      "I was pleased because...",
      "Have you ever felt like that?"
    ]
  },
  {
    waffle: "Ask your teacher which invention has changed everyday life the most.",
    goal: "Compare your opinions and explain your reasons.",
    starters: [
      "I'd probably choose...",
      "What would you choose?",
      "Why?"
    ]
  },
  {
    waffle: "Tell your teacher about something you'd like to learn outside the classroom.",
    goal: "Find out what your teacher would like to learn too.",
    starters: [
      "I'd love to learn...",
      "What about you?",
      "Why does that interest you?"
    ]
  },
  {
    waffle: "Ask your teacher about a challenge they overcame.",
    goal: "Find out what helped them succeed.",
    starters: [
      "What was the biggest challenge?",
      "How did you overcome it?",
      "What advice would you give?"
    ]
  },
  {
    waffle: "Tell your teacher about something you hope never changes.",
    goal: "Find one thing you both agree is worth keeping.",
    starters: [
      "I'd never want... to change.",
      "What about you?",
      "Why is it important?"
    ]
  }
];
