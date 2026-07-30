import { describe, expect, it } from 'vitest';
import {
  localDateMakassar,
  startOfWeekMakassar,
  toMakassarParts,
  weekId,
} from '@/lib/week';

describe('week / Asia/Makassar', () => {
  it('formats local date', () => {
    // 2026-07-30 00:00 UTC = 08:00 Makassar same day
    const d = new Date('2026-07-30T00:00:00.000Z');
    expect(localDateMakassar(d)).toBe('2026-07-30');
  });

  it('week starts Monday Makassar', () => {
    // Thursday 2026-07-30
    const d = new Date('2026-07-30T04:00:00.000Z');
    const start = startOfWeekMakassar(d);
    const parts = toMakassarParts(start);
    // Monday 2026-07-27
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(7);
    expect(parts.day).toBe(27);
    expect(parts.hour).toBe(0);
  });

  it('produces weekId string', () => {
    const id = weekId(new Date('2026-07-30T04:00:00.000Z'));
    expect(id).toMatch(/^2026-W\d{2}$/);
  });
});
