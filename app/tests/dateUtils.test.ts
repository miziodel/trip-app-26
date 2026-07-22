import { describe, it, expect } from 'vitest';
import { formatDate } from '../src/utils/dateUtils';

describe('formatDate', () => {
  it('formats ISO dates correctly in Italian format (dd-mm-yy ddd)', () => {
    expect(formatDate('2026-07-28')).toBe('28-07-26 mar');
    expect(formatDate('2026-07-27')).toBe('27-07-26 lun');
  });

  it('handles empty or invalid date strings gracefully', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });
});
