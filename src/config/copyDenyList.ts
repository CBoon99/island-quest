/** Child-facing copy deny-list (B6). Used by unit tests + optional runtime lint. */

export const CHILD_COPY_DENY_LIST = [
  'lesson',
  'homework',
  'examination',
  'exam',
  'grade',
  'graded',
  'test result',
  'curriculum',
  'failed',
  'fail',
  'remedial',
  'poor performance',
] as const;

/** Paths under src/ that are parent-only (may use plain adult language). */
export const PARENT_PATH_ALLOW = [
  '/routes/parent/',
  '/features/parent/',
  'copyDenyList',
];
