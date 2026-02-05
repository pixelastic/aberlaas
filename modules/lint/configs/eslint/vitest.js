// @vitest/plugins requires @typescript-eslint/utils and typescripts as deps
// See: https://github.com/vitest-dev/eslint-plugin-vitest/issues/543
import pluginVitest from '@vitest/eslint-plugin';

export default [
  {
    name: 'aberlaas/vitest',
    files: ['**/__tests__/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        afterAll: true,
        afterEach: true,
        beforeAll: true,
        beforeEach: true,
        describe: true,
        expect: true,
        it: true,
        test: true,
        vitest: true,
        vi: true,
        captureOutput: false,
        dedent: false,
        fdescribe: false,
        fit: false,
        testName: false,
        xdescribe: false,
        xit: false,
      },
    },
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'no-restricted-globals': [
        'error',
        { name: 'fit', message: 'No focused test' },
        { name: 'fdescribe', message: 'No focused tests' },
        { name: 'xit', message: 'No skipped test' },
        { name: 'xdescribe', message: 'No skipped tests' },
      ],
      // In tests, we like to have the variable 'current' hold the object
      // under test. The import/no-named-as-default-member would have warned
      // us about using current.foo rather than foo directly, so we disable
      // it.
      'import/no-named-as-default-member': ['off'],
      'vitest/consistent-test-it': ['warn', { fn: 'it' }],
      // Disabling vitest/no-identical-title
      // It can make eslint crash when used with fit/xit/fdescribe/xdescribe
      // See: https://github.com/veritem/eslint-plugin-vitest/issues/310
      'vitest/no-identical-title': ['off'],
      'vitest/prefer-to-contain': ['error'],
    },
  },
];
