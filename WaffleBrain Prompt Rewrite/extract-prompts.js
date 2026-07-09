#!/usr/bin/env node
/**
 * extract-prompts.js
 *
 * Standalone, one-off utility. Does NOT touch any app files.
 *
 * Reads a prompts JSON file, extracts ONLY the prompt text (in order),
 * and writes prompts.txt — one prompt per line, no numbering, no JSON,
 * no quotation marks.
 *
 * Usage:
 *   node extract-prompts.js [path-to-prompts.json] [path-to-output.txt]
 *
 * Defaults:
 *   input:  ./prompts.json
 *   output: ./prompts.txt
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'prompts.json';
const outputPath = process.argv[3] || 'prompts.txt';

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  fail(`Input file not found: ${path.resolve(inputPath)}`);
}

let raw;
try {
  raw = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
  fail(`Could not read input file: ${err.message}`);
}

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  fail(`Input file is not valid JSON: ${err.message}`);
}

// Normalize into a flat array of entries to scan for prompt text.
// Supports:
//   - top-level array of objects: [{ prompt: "...", ... }, ...]
//   - top-level object with an array under a known key (e.g. "prompts")
//   - top-level object whose values are arrays of entries (categorized JSON)
function collectEntries(json) {
  if (Array.isArray(json)) return json;

  if (json && typeof json === 'object') {
    // Common wrapper key
    if (Array.isArray(json.prompts)) return json.prompts;

    // Categorized structure: gather any arrays found anywhere in the object
    const collected = [];
    const seen = new Set();

    function walk(node) {
      if (Array.isArray(node)) {
        for (const item of node) {
          if (item && typeof item === 'object' && !seen.has(item)) {
            seen.add(item);
            collected.push(item);
          }
        }
      } else if (node && typeof node === 'object') {
        for (const key of Object.keys(node)) {
          walk(node[key]);
        }
      }
    }

    walk(json);
    return collected;
  }

  return [];
}

const entries = collectEntries(data);

if (entries.length === 0) {
  fail('No array of prompt entries found in the input JSON.');
}

// Extract prompt text from each entry. Tries common field names in order.
const PROMPT_FIELDS = ['prompt', 'promptText', 'text', 'waffle'];

function extractPromptText(entry) {
  if (typeof entry === 'string') return entry;

  if (entry && typeof entry === 'object') {
    for (const field of PROMPT_FIELDS) {
      if (typeof entry[field] === 'string' && entry[field].trim() !== '') {
        return entry[field];
      }
    }
  }

  return null;
}

const lines = [];
let skipped = 0;

for (const entry of entries) {
  const text = extractPromptText(entry);
  if (text === null) {
    skipped++;
    continue;
  }

  // Strip quotation marks, collapse internal newlines so each prompt
  // stays on exactly one line, and trim whitespace.
  const cleaned = text
    .replace(/["“”]/g, '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned !== '') {
    lines.push(cleaned);
  } else {
    skipped++;
  }
}

if (lines.length === 0) {
  fail('No prompt text could be extracted from the input JSON.');
}

try {
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
} catch (err) {
  fail(`Could not write output file: ${err.message}`);
}

console.log(`Done. Wrote ${lines.length} prompt(s) to ${path.resolve(outputPath)}.`);
if (skipped > 0) {
  console.log(`Skipped ${skipped} entr${skipped === 1 ? 'y' : 'ies'} with no usable prompt text.`);
}
