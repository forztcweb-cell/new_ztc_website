import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const editorialPath = path.join(root, 'solutions', 'src', 'content', 'editorial.txt');
const editorial = fs.readFileSync(editorialPath, 'utf8').replace(/\r/g, '');
const lines = editorial.split('\n');

const categoryMap = {
  1: { category: 'Enterprise Core', group: 'core', tags: ['Enterprise', 'Multi-Agent', 'Orchestration', 'Workflows'] },
  2: { category: 'Critical Care & Health', group: 'health-public', tags: ['Healthcare', 'Hospitals', 'Emergency', 'Coordination'] },
  3: { category: 'Logistics & Supply', group: 'logistics-physical', tags: ['Supply Chain', 'Warehousing', 'Fulfillment', 'Fleet'] },
  4: { category: 'Physical Infrastructure', group: 'logistics-physical', tags: ['IoT', 'Predictive Maintenance', 'Sensors', 'Industrial'] },
  5: { category: 'Finance & Capital', group: 'finance-legal', tags: ['Reconciliation', 'Invoicing', 'Treasury', 'Auditing'] },
  6: { category: 'Personal Intelligence', group: 'core', tags: ['Personal Ops', 'Scheduling', 'Communications', 'Productivity'] },
  7: { category: 'Automotive & Fleet', group: 'commercial-growth', tags: ['Automotive', 'Dealerships', 'Inventory', 'After-Sales'] },
  8: { category: 'Commerce & Retail', group: 'commercial-growth', tags: ['E-Commerce', 'Catalog', 'Demand Forecasting', 'Returns'] },
  9: { category: 'Real Estate & Property', group: 'commercial-growth', tags: ['Real Estate', 'Property Management', 'Leads', 'Pipeline'] },
  10: { category: 'Manufacturing & Plants', group: 'logistics-physical', tags: ['Manufacturing', 'Quality Control', 'Production', 'Supply'] },
  11: { category: 'Cybersecurity Operations', group: 'core', tags: ['Cybersecurity', 'SOC Automation', 'Incident Response', 'Triage'] },
  12: { category: 'Public Sector & Gov', group: 'health-public', tags: ['Public Sector', 'Citizen Services', 'Safety', 'Municipal'] },
  13: { category: 'Legal Operations', group: 'finance-legal', tags: ['Legal Ops', 'Contracts', 'Compliance', 'Deadlines'] },
  14: { category: 'Human Resources & Talent', group: 'core', tags: ['HR', 'Onboarding', 'Lifecycle', 'Recruiting'] },
  15: { category: 'Sales Operations', group: 'commercial-growth', tags: ['Sales Pipeline', 'Lead Routing', 'Opportunity Tracking', 'CRM'] },
  16: { category: 'Marketing Operations', group: 'commercial-growth', tags: ['Marketing Ops', 'Campaign Automation', 'Analytics', 'Conversion'] },
  17: { category: 'Education & Academics', group: 'health-public', tags: ['Education', 'Admissions', 'Student Ops', 'Institutions'] },
  18: { category: 'Hospitality & Travel', group: 'commercial-growth', tags: ['Hospitality', 'Hotels', 'Guest Experience', 'Housekeeping'] },
  19: { category: 'Environmental & Resources', group: 'logistics-physical', tags: ['Environmental', 'Energy', 'Emissions', 'Sustainability'] }
};

const solutions = [];
let current = null;
let mode = 'intro';
const headerRegex = /^(\d+)\.\s+([^:]+):\s+(.+)$/;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const match = line.match(headerRegex);
  if (match) {
    if (current) solutions.push(current);
    const id = parseInt(match[1]);
    const meta = categoryMap[id] || { category: 'General', group: 'core', tags: [] };
    current = {
      id,
      number: match[1].padStart(2, '0'),
      name: match[2].trim(),
      subtitle: match[3].trim(),
      fullName: match[2].trim() + ': ' + match[3].trim(),
      slug: match[2].trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      category: meta.category,
      group: meta.group,
      tags: meta.tags,
      intro: [],
      capabilities: [],
      scenario: [],
      result: []
    };
    mode = 'intro';
    continue;
  }
  
  if (line === '---' || line.startsWith('One Intelligence Vision')) {
    if (current) {
      solutions.push(current);
      current = null;
    }
    break;
  }
  
  if (!current) continue;
  
  if (line === 'What can it do?') {
    mode = 'capabilities';
    continue;
  }
  if (line === 'The result') {
    mode = 'result';
    continue;
  }
  if (line.startsWith('AI-powered monitoring and public safety')) {
    mode = 'scenario';
    current.scenario.push(line);
    continue;
  }
  
  if (line.startsWith('- ')) {
    current.capabilities.push(line.slice(2));
    continue;
  }
  
  if (line) {
    if (mode === 'capabilities') mode = 'scenario';
    if (mode === 'intro') current.intro.push(line);
    else if (mode === 'scenario') current.scenario.push(line);
    else if (mode === 'result') current.result.push(line);
  }
}
if (current) solutions.push(current);

// Parse the essays after heading 19
const postContent = editorial.slice(editorial.indexOf('One Intelligence Vision. Multiple Industry Systems.'));
const essaySections = [];
const essayHeadings = [
  'One Intelligence Vision. Multiple Industry Systems.',
  'From AI That Answers to Intelligence That Executes',
  'Built in India. Designed for Global Operations.',
  'The Future: Organizations That Run With Less Operational Friction',
  'Have an operation worth transforming?'
];

let currentEssay = null;
const postLines = postContent.split('\n');
for (const raw of postLines) {
  const line = raw.trim();
  if (!line) continue;
  if (essayHeadings.includes(line)) {
    if (currentEssay) essaySections.push(currentEssay);
    currentEssay = { title: line, paragraphs: [], list: [] };
    continue;
  }
  if (line.startsWith('- ') && currentEssay) {
    currentEssay.list.push(line.slice(2));
    continue;
  }
  if (currentEssay) {
    currentEssay.paragraphs.push(line);
  }
}
if (currentEssay) essaySections.push(currentEssay);

console.log(`Extracted ${solutions.length} industry solutions and ${essaySections.length} essay sections.`);

// Save solutions-data.js to public/static/solutions-data.js
const solutionsDataJs = `/* Zatics Intelligence — 19 Industry Solutions & Architecture Knowledge Base */
window.__SOLUTIONS_DATA__ = ${JSON.stringify({
  count: solutions.length,
  updated: '2026-08-06',
  featuredSlug: 'building-intelligence-across-industries',
  solutions,
  essaySections
}, null, 2)};
`;

fs.writeFileSync(path.join(root, 'public', 'static', 'solutions-data.js'), solutionsDataJs);
console.log('Saved public/static/solutions-data.js');
