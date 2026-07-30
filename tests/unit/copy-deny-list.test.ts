import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHILD_COPY_DENY_LIST } from '@/config/copyDenyList';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const srcRoot = path.join(root, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'parent') continue; // parent shell may use plain language
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      // Skip deny-list definition + pure types/schemas/repos that are not UI copy
      if (entry.name === 'copyDenyList.ts') continue;
      out.push(full);
    }
  }
  return out;
}

/** Extract approximate string literal contents for child UI scan. */
function stringLiterals(source: string): string[] {
  const found: string[] = [];
  const re = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    found.push(m[2]);
  }
  // JSX text nodes between tags (rough)
  const jsx = source.matchAll(/>([^<>{}\n]+)</g);
  for (const j of jsx) {
    const t = j[1].trim();
    if (t.length > 1) found.push(t);
  }
  return found;
}

describe('child UI copy deny-list (B6)', () => {
  it('lists the required forbidden terms', () => {
    for (const term of [
      'lesson',
      'homework',
      'examination',
      'curriculum',
      'remedial',
      'poor performance',
    ]) {
      expect(CHILD_COPY_DENY_LIST.map((t) => t.toLowerCase())).toContain(term);
    }
  });

  it('does not place forbidden school language in child-facing src strings', () => {
    const files = walk(srcRoot);
    expect(files.length).toBeGreaterThan(10);

    const violations: string[] = [];

    for (const file of files) {
      // Focus on routes + components + features UI surfaces
      const rel = path.relative(srcRoot, file);
      if (
        rel.startsWith('repositories/') ||
        rel.startsWith('schemas/') ||
        rel.startsWith('types/') ||
        rel.startsWith('lib/') ||
        rel.startsWith('data/') ||
        rel.startsWith('test/')
      ) {
        continue;
      }

      const source = fs.readFileSync(file, 'utf8');
      const literals = stringLiterals(source);
      for (const lit of literals) {
        const lower = lit.toLowerCase();
        for (const term of CHILD_COPY_DENY_LIST) {
          // word-ish match; skip pure identifiers in template code
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i');
          if (re.test(lower)) {
            violations.push(`${rel}: "${lit.slice(0, 80)}" contains "${term}"`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
