#!/usr/bin/env node
// ─────────────────────────────────────────────
//  WaffleBrain — scripts/export-pdf.js
//  Exports Waffles from data/waffles.json as printable card packs
//  (e.g. for Teachers Pay Teachers listings): 4 cards per page, in A4
//  and US Letter, as print-ready HTML and — when a headless browser is
//  available — PDF.
//
//  Usage:
//    node scripts/export-pdf.js --collection=Kids --subcategory="Gaming & Pixel Worlds"
//    node scripts/export-pdf.js --collection=ielts --level=B1
//    node scripts/export-pdf.js --help
//
//  Output: dist/pdf-packs/<pack-name>/  (git-ignored; never published)
//
//  PDFs need Playwright (npm i -D playwright && npx playwright install
//  chromium) or Puppeteer (npm i -D puppeteer). Without either, the script
//  still writes the HTML: open it in Chrome → Print → Save as PDF
//  (Margins: None, Background graphics: on).
//
//  Reads data only — it never changes data/waffles.json.
// ─────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const DATA_FILE   = path.join(ROOT, 'data', 'waffles.json');
const OUT_ROOT    = path.join(ROOT, 'dist', 'pdf-packs');
const COLLECTIONS = require(path.join(ROOT, 'collections.js'));

const FOOTER = 'GapTheMind Teaching Resources | Access 2,000+ interactive digital cards at WaffleBrain.com';
const CARDS_PER_PAGE = 4;

const LEVELS = {
  A1A2: { label: 'A1/A2', name: 'Beginner',     accent: '#0B6E73' },
  B1:   { label: 'B1',    name: 'Intermediate', accent: '#B4480B' },
  'B2+':{ label: 'B2+',   name: 'Advanced',     accent: '#A3123A' },
};

const PAPERS = {
  a4:     { label: 'A4',        css: 'A4',     width: '210mm',  height: '297mm',  pdf: 'A4' },
  letter: { label: 'US Letter', css: 'letter', width: '8.5in',  height: '11in',   pdf: 'Letter' },
};

// ── Command-line options ──────────────────────
const HELP = `
Export WaffleBrain cards as printable 4-per-page packs (HTML + PDF).

  --collection=<id or name>    e.g. kids, "Business English", ielts
  --subcategory=<name>         a category in that Collection, e.g. "Gaming & Pixel Worlds"
                               (alias: --category)
  --level=<A1A2|B1|B2+>        optional; "A1/A2", "A2" and "B2" also work
  --paper=<a4|letter|both>     default: both
  --format=<html|pdf|both>     default: both (PDF only if a headless browser is installed)
  --teacher=<yes|no>           include the Teacher Prompt on each card (default: yes)
  --title="<pack title>"       default: built from the filters
  --limit=<n>                  only the first n matching Waffles
  --out=<folder>               default: dist/pdf-packs/<pack-name>
  --help                       show this help

Examples:
  node scripts/export-pdf.js --collection=Kids --subcategory="Gaming & Pixel Worlds"
  node scripts/export-pdf.js --collection=medical --level=B1 --paper=letter
`;

function parseArgs(argv) {
  const opts = {};
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)(?:=(.*))?$/i);
    if (!m) { fail(`Unrecognised argument: ${arg}\n${HELP}`); }
    opts[m[1].toLowerCase()] = m[2] === undefined ? true : m[2];
  }
  return opts;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const norm = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9+]+/g, ' ').trim();
const slug = (s) => norm(s).replace(/\+/g, 'plus').replace(/\s+/g, '-');

function resolveCollection(value) {
  const c = COLLECTIONS.find(c => norm(c.id) === norm(value) || norm(c.name) === norm(value));
  if (!c) fail(`Unknown collection "${value}". Choose one of: ${COLLECTIONS.map(c => `${c.id} (${c.name})`).join(', ')}`);
  return c;
}

function resolveLevel(value) {
  const v = norm(value).replace(/\s/g, '');
  const map = { a1a2: 'A1A2', a1: 'A1A2', a2: 'A1A2', 'a1/a2': 'A1A2', b1: 'B1', 'b2+': 'B2+', b2: 'B2+', c1: 'B2+' };
  const level = map[v] || map[String(value).toLowerCase().replace(/\s/g, '')];
  if (!level) fail(`Unknown level "${value}". Use A1A2, B1 or B2+.`);
  return level;
}

// ── HTML ──────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function cardHtml(w, collectionName, withTeacher) {
  const lv = LEVELS[w.level] || { label: w.level, name: '', accent: '#222' };
  const s = w.student || {}, t = w.teacher || {};
  const starters = Array.isArray(s.starters) ? s.starters : [];
  return `
    <article class="card" style="--accent:${lv.accent}">
      <header class="card-head">
        <span class="level">${esc(lv.label)}<small>${esc(lv.name)}</small></span>
        <span class="topic">${esc(collectionName)} · ${esc(w.category)}</span>
        <span class="num">#${esc(w.id)}</span>
      </header>
      <div class="card-body">
        <p class="prompt">${esc(s.prompt || t.prompt || '')}</p>
        ${s.goal ? `<div class="goal"><span class="tag">Goal</span>${esc(s.goal)}</div>` : ''}
        ${starters.length ? `<div class="starters"><span class="tag">Say it</span><ul>${starters.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        ${t.constraint ? `<div class="focus"><span class="tag">Language focus</span>${esc(t.constraint)}</div>` : ''}
        ${withTeacher && t.prompt && s.prompt ? `<p class="teacher"><b>Teacher:</b> ${esc(t.prompt)}</p>` : ''}
      </div>
    </article>`;
}

function pageHtml(cards, pageNo, pageCount, title, collectionName, withTeacher) {
  const filled = cards.map(w => cardHtml(w, collectionName, withTeacher));
  while (filled.length < CARDS_PER_PAGE) filled.push('<div class="card blank" aria-hidden="true"></div>');
  return `
  <section class="sheet">
    <div class="sheet-title"><span>WaffleBrain</span> ${esc(title)}</div>
    <div class="grid">${filled.join('')}</div>
    <footer class="sheet-foot">
      <span>${esc(FOOTER)}</span>
      <span class="page">${pageNo} / ${pageCount}</span>
    </footer>
  </section>`;
}

function documentHtml({ waffles, paper, title, collectionName, withTeacher }) {
  const pages = [];
  for (let i = 0; i < waffles.length; i += CARDS_PER_PAGE) pages.push(waffles.slice(i, i + CARDS_PER_PAGE));
  const body = pages.map((p, i) => pageHtml(p, i + 1, pages.length, title, collectionName, withTeacher)).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)} — ${esc(paper.label)}</title>
<style>
  @page { size: ${paper.css}; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #E9E6DF; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* One printed page: ${paper.label} */
  .sheet {
    width: ${paper.width}; height: ${paper.height};
    margin: 10mm auto; padding: 9mm 9mm 7mm;
    background: #FFFFFF; display: flex; flex-direction: column;
    page-break-after: always; break-after: page; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.18);
  }
  @media print { html, body { background: #FFFFFF; } .sheet { margin: 0; box-shadow: none; } }

  .sheet-title {
    font: 700 8.5pt/1 'Courier New', Courier, monospace; letter-spacing: .14em; text-transform: uppercase;
    color: #333; padding-bottom: 3mm; text-align: center;
  }
  .sheet-title span { background: #111; color: #FFF; padding: 1mm 2mm; margin-right: 2mm; }

  /* 2 × 2 grid; dashed gutters are the cutting lines */
  .grid {
    flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
    gap: 8mm; position: relative;
  }
  .grid::before, .grid::after { content: ''; position: absolute; border: 0 dashed #9A968C; pointer-events: none; }
  .grid::before { left: 50%; top: -3mm; bottom: -3mm; border-left-width: .6pt; }
  .grid::after  { top: 50%; left: -3mm; right: -3mm; border-top-width: .6pt; }

  /* Card: heavy ink border, hard offset shadow, halftone header — a retro print look */
  .card {
    position: relative; z-index: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;
    border: 2.4pt solid #111; border-radius: 3mm; background: #FFFDF8;
    box-shadow: 1.6mm 1.6mm 0 #111;
    margin: 0 1.6mm 1.6mm 0;
  }
  .card.blank { visibility: hidden; }   /* empty slots on a part-filled last page: no ink */
  .card-head {
    display: flex; align-items: center; gap: 2mm; padding: 2.2mm 3mm;
    border-bottom: 2pt solid #111; color: #FFF; background-color: var(--accent);
    background-image: radial-gradient(rgba(255,255,255,.22) .45mm, transparent .5mm);
    background-size: 1.6mm 1.6mm;
  }
  .level { font: 700 11pt/1 'Courier New', Courier, monospace; background: #111; padding: 1.2mm 2mm; border-radius: 1mm; white-space: nowrap; }
  .level small { font-size: 6.5pt; font-weight: 700; margin-left: 1.5mm; letter-spacing: .06em; text-transform: uppercase; }
  .topic { flex: 1; min-width: 0; font: 700 7pt/1.2 'Courier New', Courier, monospace; letter-spacing: .06em; text-transform: uppercase; }
  .num { font: 700 7pt/1 'Courier New', Courier, monospace; opacity: .9; }

  .card-body { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 2.4mm; padding: 3.2mm 3.4mm 3mm; font-size: calc(12.5pt * var(--fit, 1)); }
  .prompt { font: 700 1.45em/1.26 Georgia, 'Times New Roman', serif; }
  .tag {
    display: inline-block; font: 700 .64em/1 'Courier New', Courier, monospace; letter-spacing: .12em; text-transform: uppercase;
    color: #FFF; background: #111; padding: .6mm 1.4mm; margin-right: 1.6mm; vertical-align: .15em;
  }
  .goal { font-size: 1em; line-height: 1.35; }
  .starters ul { list-style: none; margin-top: 1.4mm; display: flex; flex-direction: column; gap: 1mm; }
  .starters li { font-size: 1em; line-height: 1.3; padding-left: 4mm; position: relative; }
  .starters li::before { content: '›'; position: absolute; left: 0; font-weight: 700; color: var(--accent); }
  .focus {
    margin-top: auto; border: 1.4pt solid #111; border-left: 3mm solid var(--accent);
    background: #FFF6DB; padding: 1.8mm 2.4mm; font-size: .92em; line-height: 1.32;
  }
  .teacher { font-size: .8em; line-height: 1.3; color: #333; border-top: .8pt dashed #777; padding-top: 1.6mm; }

  .sheet-foot {
    display: flex; justify-content: space-between; align-items: center; gap: 4mm;
    margin-top: 4mm; padding-top: 2.4mm; border-top: 1.6pt solid #111;
    font: 700 7.4pt/1.2 'Courier New', Courier, monospace; letter-spacing: .03em; color: #111;
  }
  .sheet-foot .page { white-space: nowrap; }
</style>
</head>
<body>
${body}
<script>
  // Shrink any card whose text doesn't fit (long Waffles) so nothing is cut off.
  document.querySelectorAll('.card-body').forEach(function (b) {
    var fit = 1;
    while (b.scrollHeight > b.clientHeight + 1 && fit > 0.5) {
      fit -= 0.04;
      b.style.setProperty('--fit', fit.toFixed(2));
    }
  });
  document.documentElement.dataset.fitted = '1';
</script>
</body>
</html>
`;
}

// ── PDF (optional) ────────────────────────────
function loadBrowser() {
  for (const name of ['playwright', 'puppeteer']) {
    try { return { name, lib: require(name) }; } catch (e) { /* not installed */ }
  }
  return null;
}

async function renderPdfs(jobs) {
  const found = loadBrowser();
  if (!found) {
    console.log('  (PDF skipped: Playwright/Puppeteer not installed. Open the .html in Chrome → Print → Save as PDF,');
    console.log('   with Margins: None and Background graphics on. Or: npm i -D playwright && npx playwright install chromium)');
    return [];
  }
  const browser = found.name === 'playwright'
    ? await found.lib.chromium.launch()
    : await found.lib.launch();
  const written = [];
  try {
    for (const job of jobs) {
      const page = await browser.newPage();
      await page.goto('file://' + job.html, { waitUntil: 'load' });
      await page.waitForFunction(() => document.documentElement.dataset.fitted === '1');
      await page.pdf({ path: job.pdf, format: job.paper.pdf, printBackground: true, preferCSSPageSize: true,
                       margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      await page.close();
      written.push(job.pdf);
    }
  } finally {
    await browser.close();
  }
  return written;
}

// ── Main ──────────────────────────────────────
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return; }
  if (!opts.collection) fail(`--collection is required.\n${HELP}`);

  const collection = resolveCollection(opts.collection);
  const all = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')).filter(w => w.collection === collection.id);
  const categories = [...new Set(all.map(w => w.category))];

  const subcategory = opts.subcategory || opts.category;
  let category = null;
  if (subcategory && subcategory !== true) {
    category = categories.find(c => norm(c) === norm(subcategory));
    if (!category) fail(`"${subcategory}" is not a category in ${collection.name}. Choose one of: ${categories.join(' · ')}`);
  }
  const level = opts.level ? resolveLevel(opts.level) : null;

  const order = ['A1A2', 'B1', 'B2+'];
  let waffles = all
    .filter(w => (!category || w.category === category) && (!level || w.level === level))
    .sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || categories.indexOf(a.category) - categories.indexOf(b.category) || a.id - b.id);
  if (opts.limit) waffles = waffles.slice(0, Math.max(1, parseInt(opts.limit, 10) || 0));
  if (!waffles.length) fail('No Waffles match those filters.');

  const paperOpt = String(opts.paper || 'both').toLowerCase();
  const papers = paperOpt === 'both' ? ['a4', 'letter'] : [paperOpt];
  if (papers.some(p => !PAPERS[p])) fail(`--paper must be a4, letter or both.`);
  const format = String(opts.format || 'both').toLowerCase();
  if (!['html', 'pdf', 'both'].includes(format)) fail('--format must be html, pdf or both.');
  const withTeacher = !/^(no|false|0)$/i.test(String(opts.teacher || 'yes'));

  const levelsInPack = [...new Set(waffles.map(w => w.level))];
  const title = (opts.title && opts.title !== true) ? opts.title
    : [collection.name, category, levelsInPack.map(l => LEVELS[l].label).join(' & ')].filter(Boolean).join(' · ');
  const packName = slug([collection.id, category || 'all-categories', level || levelsInPack.join(' ')].join(' '));
  const outDir = opts.out && opts.out !== true ? path.resolve(opts.out) : path.join(OUT_ROOT, packName);
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = papers.map(p => {
    const paper = PAPERS[p];
    const html = path.join(outDir, `${packName}-${p}.html`);
    fs.writeFileSync(html, documentHtml({ waffles, paper, title, collectionName: collection.name, withTeacher }));
    return { paper, html, pdf: path.join(outDir, `${packName}-${p}.pdf`) };
  });

  const pages = Math.ceil(waffles.length / CARDS_PER_PAGE);
  console.log(`✓ ${waffles.length} Waffles → ${pages} page(s) per paper size (${title})`);
  jobs.forEach(j => console.log(`  HTML: ${path.relative(ROOT, j.html)}`));
  if (format !== 'html') {
    const pdfs = await renderPdfs(jobs);
    pdfs.forEach(p => console.log(`  PDF:  ${path.relative(ROOT, p)}`));
  }
  if (format === 'pdf') jobs.forEach(j => fs.existsSync(j.pdf) && fs.unlinkSync(j.html));
}

main().catch(err => fail(err.stack || String(err)));
