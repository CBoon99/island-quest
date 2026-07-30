import type { Question } from '@/types';

// Vite glob import of content bank
const modules = import.meta.glob('../../../content/questions/**/*.json', {
  eager: true,
});

function isQuestionArray(v: unknown): v is Question[] {
  return Array.isArray(v);
}

export function loadQuestionBank(): Question[] {
  const all: Question[] = [];
  for (const [path, mod] of Object.entries(modules)) {
    if (path.endsWith('manifest.json')) continue;
    const data = (mod as { default: unknown }).default;
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
