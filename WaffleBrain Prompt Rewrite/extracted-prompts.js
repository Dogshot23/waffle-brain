#!/usr/bin/env node
/**
 * extract-prompts.js
 *
 * Reads WaffleBrain's master prompts.json and extracts every "prompt"
 * field, in exact source order, writing one prompt per line to
 * prompts.txt. Any internal line breaks within a prompt are replaced
 * with spaces so each prompt occupies exactly one line.
 *
 * Does NOT modify prompts.json or any other project file.
 *
 * Usage:
 *   node extract-prompts.js [input_json] [output_txt]
 *
 * Defaults:
 *   input_json = prompts.json
 *   output_txt = prompts.txt
 */

const fs = require('fs');
const path = require('path');

function main() {
  const inputPath = process.argv[2] || 'prompts.json';
  const outputPath = process.argv[3] || 'prompts.txt';

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(raw);

  const lines = [];

  // Walk { level: { category: [ {prompt, constraint}, ... ] } }
  // in the exact key/array order as they appear in the source JSON.
  for (const level of Object.keys(data)) {
    const categories = data[level];
    if (categories === null || typeof categories !== 'object' || Array.isArray(categories)) {
      continue;
    }
    for (const category of Object.keys(categories)) {
      const items = categories[category];
      if (!Array.isArray(items)) {
        continue;
      }
      for (const item of items) {
        if (item && typeof item === 'object' && typeof item.prompt === 'string') {
          const singleLine = item.prompt.replace(/\r\n|\r|\n/g, ' ');
          lines.push(singleLine);
        }
      }
    }
  }

  fs.writeFileSync(outputPath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf-8');

  console.log(`Extracted ${lines.length} prompts from '${inputPath}' -> '${outputPath}'`);
}

main();
