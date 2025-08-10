import { multiply } from '../index';

describe('multiply function', () => {
  it('should multiply two numbers and add 5', () => {
    expect(multiply(2, 3)).toBe(11); // 2 * 3 + 5 = 11
    expect(multiply(5, 4)).toBe(25); // 5 * 4 + 5 = 25
    expect(multiply(0, 10)).toBe(5); // 0 * 10 + 5 = 5
  });
});