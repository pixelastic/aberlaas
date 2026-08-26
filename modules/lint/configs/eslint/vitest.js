// @vitest/plugins requires @typescript-eslint/utils and typescripts as deps
// See: https://github.com/vitest-dev/eslint-plugin-vitest/issues/543
import pluginVitest from '@vitest/eslint-plugin';
import ruleNoManualMockCleanup from './rules/test/no-manual-mock-cleanup.js';
import rulePreferExpectToHaveProperty from './rules/test/prefer-expect-to-have-property.js';
import rulePreferMockReturnValue from './rules/test/prefer-mock-return-value.js';

export default [
  {
    name: 'aberlaas/vitest',
    files: ['**/__tests__/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        afterAll: false,
        afterEach: false,
        beforeAll: false,
        beforeEach: false,
        bench: false,
        captureOutput: false,
        dedent: false,
        describeName: false,
        describe: false,
        expect: false,
        fdescribe: false,
        fit: false,
        it: false,
        mockStdin: false,
        testName: false,
        test: false,
        vitest: false,
        vi: false,
        xdescribe: false,
        xit: false,
      },
    },
    plugins: {
      'aberlaas-test': {
        rules: {
          'no-manual-mock-cleanup': ruleNoManualMockCleanup,
          'prefer-expect-to-have-property': rulePreferExpectToHaveProperty,
          'prefer-mock-return-value': rulePreferMockReturnValue,
        },
      },
      vitest: pluginVitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      // Warn about focused and skipped tests
      'no-restricted-globals': [
        'error',
        { name: 'fit', message: 'No focused test' },
        { name: 'fdescribe', message: 'No focused tests' },
        { name: 'xit', message: 'No skipped test' },
        { name: 'xdescribe', message: 'No skipped tests' },
      ],
      // Don't warn for expect() inside of custom it.slow, fit, xit
      'vitest/no-standalone-expect': [
        'error',
        {
          additionalTestBlockFunctions: ['it.slow', 'fit', 'xit'],
        },
      ],
      // Prefer it() over test()
      'vitest/consistent-test-it': ['warn', { fn: 'it' }],
      // In tests, we like to have the variable 'current' hold the object
      // under test. The import/no-named-as-default-member would have warned
      // us about using current.foo rather than foo directly, so we disable
      // it.
      'import/no-named-as-default-member': ['off'],
      // Disabling vitest/no-identical-title
      // It can make eslint crash when used with fit/xit/fdescribe/xdescribe
      // See: https://github.com/veritem/eslint-plugin-vitest/issues/310
      'vitest/no-identical-title': ['off'],
      'vitest/prefer-to-contain': ['error'],
      'vitest/no-importing-vitest-globals': ['error'],
      // Ban weak matchers
      'vitest/no-restricted-matchers': [
        'error',
        {
          toBeTruthy: 'Use `toBe(true)` or assert the exact expected value',
          toBeFalsy: 'Use `toBe(false)` or assert the exact expected value',
          toBeDefined:
            'Assert the exact expected value instead of using `toBeDefined`',
        },
      ],
      // I never use vi.mock
      'vitest/no-restricted-vi-methods': [
        'error',
        {
          mock: "Use `vi.spyOn(__, 'method')` instead of `vi.mock()`",
        },
      ],

      // Aberlaas custom rules
      'aberlaas-test/no-manual-mock-cleanup': ['error'],
      'aberlaas-test/prefer-expect-to-have-property': ['error'],
      'aberlaas-test/prefer-mock-return-value': ['error'],
    },
  },
];
