import { describe, expect, it } from 'vitest';
import { isComplete } from './expense-report.rules';

describe('expense-report rules', () => {
  it('placeholder', () => {
    expect(isComplete({ id: '1' }, {})).toBe(true);
  });
});
