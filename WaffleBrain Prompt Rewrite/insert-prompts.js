#!/usr/bin/env node
/**
 * insert-prompts.js
 *
 * Reads every line from prompts-teacher.txt and replaces the corresponding
 * `prompt` field in prompts.json (in exact traversal/document order),
 * preserving every other field untouched. Writes the result to
 * prompts-teacher.json. Does not modify the original prompts.json.
 *
 * Usage:
 *   node insert-prompts.js [prompts.json] [prompts-teacher.txt] [prompts-teacher.json]
 *
 * Defaults (if no args given):
 *   input JSON:   ./prompts.json
 *   input lines:  ./prompts-teacher.txt
 *   output JSON:  ./prompts-teacher.json
 */

const fs = require('fs');
const path = require('path');

function main() {
  const [, , argJson, argTxt, argOut] = process.argv;

  const jsonPath = argJson || path.join(__dirname, 'prompts.json');
  const txtPath = argTxt || path.join(__dirname, 'prompts-teacher.txt');
  const outPath = argOut || path.join(__dirname, 'prompts-teacher.json');

  // --- Load prompts.json ---
  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawJson);

  // --- Load prompts-teacher.txt and split into lines ---
  // Read raw (no newline normalization) so we can split on either
  // \r\n or \n, then filter out only a possible single trailing
  // empty line caused by a final newline character in the file.
  const rawTxt = fs.readFileSync(txtPath, 'utf8');
  let lines = rawTxt.split(/\r\n|\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop(); // drop trailing empty line from a final newline
  }

  // --- Walk prompts.json in document order, collecting references ---
  // Traversal order: object keys (levels) in insertion order, then
  // category keys in insertion order, then array index order.
  // This matches standard JSON.parse/JS object key iteration order,
  // which itself matches the order keys appear in the source file
  // (for non-numeric string keys).
  const promptRefs = [];

  for (const levelKey of Object.keys(data)) {
    const level = data[levelKey];
    if (!level || typeof level !== 'object') continue;

    for (const catKey of Object.keys(level)) {
      const items = level[catKey];
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        if (item && typeof item === 'object' && 'prompt' in item) {
          promptRefs.push(item);
        }
      }
    }
  }

  // --- Validate counts match before making any changes ---
  if (promptRefs.length !== lines.length) {
    console.error(
      `Mismatch: prompts.json has ${promptRefs.length} prompt entries, ` +
      `but prompts-teacher.txt has ${lines.length} lines. Aborting; no output written.`
    );
    process.exit(1);
  }

  // --- Replace each prompt field in order, preserving all other fields ---
  for (let i = 0; i < promptRefs.length; i++) {
    promptRefs[i].prompt = lines[i];
  }

  // --- Write output (original prompts.json is never touched) ---
  const outputJson = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(outPath, outputJson, 'utf8');

  console.log(`Success: wrote ${promptRefs.length} updated prompts to ${outPath}`);
}

main();
