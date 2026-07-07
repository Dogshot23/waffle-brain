# Waffle Brain Project State

## Project

Waffle Brain is an ESL speaking activity generator for online teachers.

The goal is to create interesting speaking activities for Cambly, Preply, italki style lessons.

The app is teacher first.

Prompts should not be normal conversation questions. They should be structured activities that help teachers run better lessons.

---

# Current App Structure

The app uses:

Level → Category → Prompt JSON structure

Prompt data is stored in:

/data/prompts.json

The app uses:

/engine.js
/app.js

Do not redesign the architecture unless necessary.

---

# Prompt Philosophy

Prompts should:

- be written for teachers
- reduce student cognitive load
- avoid boring interview questions
- create 2 to 5 minutes of speaking
- include structure, choices, constraints or tasks
- feel more interesting than textbook ESL questions

Avoid:

- "Tell me about..."
- "What is your favourite..."
- vague discussion questions
- abstract topics for beginners

---

# Completed Work

## A1/A2 Beginner Level

Completed category:

## Everyday Situations

Status:
DONE

Contains:
20+ prompts

Location:

/data/prompts.json

Verified working in the app.

The category now displays correctly.

---

# Current Content Style

Prompt format:

Teacher instruction

Example:

Teacher:

Give the student this situation...

Choose:

Options

Task:

What the student needs to do

Extension:

Follow-up speaking prompts

---

# Remaining A1/A2 Categories

Need to build:

1. Simple Roleplay

2. Describe

3. Explain and Show

4. Choose and Create

5. Guided Stories

---

# Current Next Step

Build:

A1/A2 Simple Roleplay

Process:

1. Refine category design rules if needed
2. Create prompts in /design/
3. Convert approved prompts into /data/prompts.json
4. Test in app

---

# Important Working Rule

The design documents are the source of truth.

Workflow:

Design document

↓

JSON conversion

↓

App testing

---

# Current Priority

Finish all A1/A2 categories before building B1/B2.