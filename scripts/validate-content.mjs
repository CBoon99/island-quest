/**
 * Content bank validation — structural gate for ACCEPT (B3 Track A).
 * Fails if active < 300, duplicate ids, bad answers, missing fields, etc.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const questionsDir = path.join(root, 'content', 'questions');

const MIN_ACTIVE = Number(process.env.CONTENT_MIN_ACTIVE || 300);
const VALID_WORLDS = new Set([
  'coral-coast',
  'jungle-trail',
  'star-harbor',
  'volcano-valley',
  'pirate-bay',
  'whisper-ruins',
]);
const VALID_CATS = new Set([
  'Numbers and Maths',
  'Words and Language',
  'Science',
  'Animals and Nature',
  'Geography',
  'History',
  'Space',
  'Ocean',
  'Indonesia and Local Knowledge',
  'General Knowledge',
  'Logic and Patterns',
  'Healthy Living and Safety',
]);

function loadAll() {
  const all = [];
  if (!fs.existsSync(questionsDir)) return all;
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.json') && name !== 'manifest.json') {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (Array.isArray(data)) all.push(...data);
        else if (data && typeof data === 'object' && data.id) all.push(data);
      }
    }
  };
  walk(questionsDir);
  return all;
}

function normalizeText(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function main() {
  const errors = [];
  const warnings = [];
  const all = loadAll();
  const ids = new Set();
  const texts = new Map();
  let active = 0;
  let reviewed = 0;
  const byDiff = { 1: 0, 2: 0, 3: 0, 4: 0 };
  let localPride = 0;
  let d12 = 0;
  let d34 = 0;

  for (const q of all) {
    if (!q.id) {
      errors.push('Question missing id');
      continue;
    }
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`);
    ids.add(q.id);

    if (!q.question || !String(q.question).trim())
      errors.push(`${q.id}: empty question`);
    if (!q.explanation || !String(q.explanation).trim())
      errors.push(`${q.id}: empty explanation`);
    if (![1, 2, 3, 4].includes(q.difficulty))
      errors.push(`${q.id}: bad difficulty`);
    if (!VALID_WORLDS.has(q.worldId)) errors.push(`${q.id}: bad worldId ${q.worldId}`);
    if (!VALID_CATS.has(q.category)) errors.push(`${q.id}: bad category ${q.category}`);
    if (!Array.isArray(q.answers) || q.answers.length < 2)
      errors.push(`${q.id}: need ≥2 answers`);
    else {
      const ansIds = new Set(q.answers.map((a) => a.id));
      if (!ansIds.has(q.correctAnswerId))
        errors.push(`${q.id}: correctAnswerId not in answers`);
      if (q.type === 'multiple-choice' && q.answers.length < 4)
        errors.push(`${q.id}: MC needs 4 answers`);
      for (const a of q.answers) {
        if (!a.id || !a.text) errors.push(`${q.id}: answer missing id/text`);
      }
    }

    if (q.status === 'active') {
      active += 1;
      byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
      if (q.difficulty <= 2) d12 += 1;
      else d34 += 1;
      if (
        q.category === 'Indonesia and Local Knowledge' ||
        q.category === 'Ocean' ||
        q.worldId === 'coral-coast'
      ) {
        localPride += 1;
      }
      if (!q.sourceName) errors.push(`${q.id}: active missing sourceName`);
      if (q.reviewedAt) reviewed += 1;
    }

    const nt = normalizeText(q.question || '');
    if (texts.has(nt) && q.status === 'active') {
      // allow mild variants — only exact normalize collision
      errors.push(`${q.id}: duplicate question text as ${texts.get(nt)}`);
    } else if (q.status === 'active') {
      texts.set(nt, q.id);
    }
  }

  if (active < MIN_ACTIVE) {
    errors.push(`active count ${active} < required ${MIN_ACTIVE}`);
  }
  if (d12 < 150) warnings.push(`difficulty 1–2 active: ${d12} (prefer ≥150)`);
  if (d34 < 150) warnings.push(`difficulty 3–4 active: ${d34} (prefer ≥150)`);
  // Treat age split as hard when MIN is 300
  if (MIN_ACTIVE >= 300 && d12 < 150)
    errors.push(`age-band low difficulties: ${d12} < 150`);
  if (MIN_ACTIVE >= 300 && d34 < 150)
    errors.push(`age-band high difficulties: ${d34} < 150`);
  if (localPride < 15 && MIN_ACTIVE >= 300)
    errors.push(`local/ocean pride active-ish count ${localPride} < 15`);

  console.log(
    JSON.stringify(
      {
        totalLoaded: all.length,
        active,
        reviewedAtSet: reviewed,
        byDiff,
        d12,
        d34,
        localPride,
        minRequired: MIN_ACTIVE,
        errorCount: errors.length,
        warningCount: warnings.length,
      },
      null,
      2,
    ),
  );
  for (const w of warnings) console.warn('WARN:', w);
  if (errors.length) {
    console.error('CONTENT VALIDATION FAILED');
    for (const e of errors.slice(0, 40)) console.error(' -', e);
    if (errors.length > 40) console.error(` ... +${errors.length - 40} more`);
    process.exit(1);
  }
  console.log('content:validate OK');
}

main();
