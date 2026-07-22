import vitestConfig from '../vitest.js';

describe('vitest config', () => {
  it('should enable no-importing-vitest-globals rule', () => {
    const rules = vitestConfig[0].rules;
    expect(rules).toHaveProperty('vitest/no-importing-vitest-globals', [
      'error',
    ]);
  });
});
