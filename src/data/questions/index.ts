import type { Question } from '../../types';

/**
 * Static JSON imports work in both Vite (browser) and Netlify Functions (esbuild).
 * Avoid import.meta.glob here — it breaks the Functions bundler.
 */
import animals from '../../../content/questions/by-category/animals.json';
import general from '../../../content/questions/by-category/general.json';
import geo from '../../../content/questions/by-category/geo.json';
import health from '../../../content/questions/by-category/health.json';
import history from '../../../content/questions/by-category/history.json';
import indonesia from '../../../content/questions/by-category/indonesia.json';
import logic from '../../../content/questions/by-category/logic.json';
import maths from '../../../content/questions/by-category/maths.json';
import ocean from '../../../content/questions/by-category/ocean.json';
import science from '../../../content/questions/by-category/science.json';
import space from '../../../content/questions/by-category/space.json';
import words from '../../../content/questions/by-category/words.json';

const FILES: unknown[] = [
  animals,
  general,
  geo,
  health,
  history,
  indonesia,
  logic,
  maths,
  ocean,
  science,
  space,
  words,
];

function isQuestionArray(v: unknown): v is Question[] {
  return Array.isArray(v);
}

export function loadQuestionBank(): Question[] {
  const all: Question[] = [];
  for (const data of FILES) {
    if (isQuestionArray(data)) {
      all.push(...data);
    } else if (data && typeof data === 'object' && 'id' in (data as object)) {
      all.push(data as Question);
    }
  }
  return all;
}

export function loadActiveQuestions(): Question[] {
  return loadQuestionBank().filter((q) => q.status === 'active');
}

export function questionsById(): Map<string, Question> {
  return new Map(loadActiveQuestions().map((q) => [q.id, q]));
}
