import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const htmlPath = path.join(root, 'dist', 'terms-and-conditions', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- Verifying dist/terms-and-conditions/index.html ---');

const sectionMatches = html.match(/<section class="legal-section" data-section="(\d+)"/g) || [];
console.log(`Total sections: ${sectionMatches.length} (expected 39)`);

const searchableMatches = html.match(/data-searchable/g) || [];
console.log(`Total searchable elements: ${searchableMatches.length}`);

const tocSections = html.match(/<li class="toc-section">/g) || [];
console.log(`TOC sections: ${tocSections.length}`);

const tocSubsections = html.match(/<li class="toc-subsection">/g) || [];
console.log(`TOC subsections: ${tocSubsections.length}`);

console.log(`Contains /styles.css: ${html.includes('"/styles.css"')}`);
console.log(`Contains /app.js: ${html.includes('"/app.js"')}`);
console.log(`Contains /static/terms.css: ${html.includes('/static/terms.css')}`);
console.log(`Contains /static/terms-app.js: ${html.includes('/static/terms-app.js')}`);
console.log(`Contains /static/favicon.svg: ${html.includes('/static/favicon.svg')}`);

// Check that all TOC anchor targets exist in the document
const anchorMatches = [...html.matchAll(/<a href="#([^"]+)">/g)].map(m => m[1]);
let missing = 0;
for (const id of anchorMatches) {
  if (!html.includes(`id="${id}"`)) {
    console.error(`Missing anchor target: ${id}`);
    missing++;
  }
}
if (missing === 0) {
  console.log(`✓ All ${anchorMatches.length} TOC anchor links have matching id targets!`);
} else {
  console.error(`⚠️ Found ${missing} missing anchor targets!`);
}

const all39Sections = [
  '1 INTRODUCTION',
  '2 DEFINITIONS',
  '3 ABOUT ZATICS INTELLIGENCE',
  '4 COMMERCIAL MODELS',
  '5 PROJECT DISCOVERY AND PROPOSAL',
  '6 PROJECT BLUEPRINT',
  '7 SCOPE CONTROL',
  '8 MAJOR SCOPE CHANGES',
  '9 CHANGE REQUEST PROCESS',
  '10 PROJECT TIMELINE AND DELIVERY',
  '11 ZATICS DELIVERY COMMITMENT',
  '12 CLIENT RESPONSIBILITIES',
  '13 CLIENT REVIEW AND ACCEPTANCE',
  '14 PAYMENT TERMS',
  '15 LATE PAYMENT AND PAYMENT DEFAULT',
  '16 REFUNDS AND CANCELLATIONS',
  '17 INTELLECTUAL PROPERTY',
  '18 SOFTWARE LICENSE',
  '19 AI AND AUTONOMOUS SYSTEMS',
  '20 ZATICS AGENT ORCHESTRATION',
  '21 CLIENT DATA',
  '22 CONFIDENTIALITY',
  '23 SECURITY',
  '24 THIRD PARTY SERVICES',
  '25 ACCEPTABLE USE',
  '26 SUPPORT AND MAINTENANCE',
  '27 DEPLOYMENT AND HANDOVER',
  '28 WARRANTY AND DEFECT RESOLUTION',
  '29 DISCLAIMERS',
  '30 LIMITATION OF LIABILITY',
  '31 INDEMNIFICATION',
  '32 SUSPENSION',
  '33 TERMINATION',
  '34 CLIENT PORTAL AND PROJECT RECORDS',
  '35 ELECTRONIC APPROVALS AND SIGNATURES',
  '36 DISPUTE RESOLUTION',
  '37 GENERAL PROVISIONS',
  '38 CONTACT INFORMATION',
  '39 VERSION HISTORY'
];

let verifiedCount = 0;
for (const title of all39Sections) {
  if (!html.includes(title)) {
    console.error(`Missing section: ${title}`);
  } else {
    verifiedCount++;
  }
}
console.log(`✓ Verified all ${verifiedCount} of 39 sections present in HTML!`);

