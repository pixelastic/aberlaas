import globals from 'globals';
import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginN from 'eslint-plugin-n';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
// Note:
// It is currently required to manually add typescript and
// @typescript-eslint/utils to aberlaas for the plugin to work
// See: https://github.com/vitest-dev/eslint-plugin-vitest/issues/543
import pluginVitest from '@vitest/eslint-plugin';
import { nodeVersion } from 'aberlaas-versions';

export default [
  {
    name: 'aberlaas/base',
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules/*', '.yarn/*'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.nodeBuiltin,
        ...globals.browser,
        ...pluginN.configs['flat/recommended'].languageOptions.globals,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    plugins: {
      import: pluginImport.flatConfigs.recommended.plugins.import,
      jsdoc: pluginJsdoc.configs['flat/recommended'].plugins.jsdoc,
      n: pluginN.configs['flat/recommended'].plugins.n,
      prettier: pluginPrettierRecommended.plugins.prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginImport.flatConfigs.recommended.rules,
      ...pluginJsdoc.configs['flat/recommended'].plugins.rules,
      ...pluginN.configs['flat/recommended'].plugins.rules,
      'dot-notation': ['error'],
      'max-len': [
        'error',
        {
          code: 80,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          // Ignore long lines in test headers, allowing us to write descriptive
          // tests
          ignorePattern: '^\\s*it\\(',
        },
      ],
      'no-console': ['off'],
      'no-irregular-whitespace': ['error', { skipRegExps: true }],
      'no-restricted-properties': [
        'error',
        {
          object: 'module',
          property: 'export',
          message: 'Typo: Use module.exports instead',
        },
        {
          object: '_',
          property: 'contains',
          message: 'Typo: Use _.includes instead',
        },
        {
          object: '_',
          property: 'padLeft',
          message: 'Typo: Use _.padStart instead',
        },
      ],
      'no-shadow': ['error'],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_.',
          varsIgnorePattern: '^_.',
          caughtErrorsIgnorePattern: '^_.',
        },
      ],
      'no-use-before-define': [
        'error',
        {
          variables: true,
          functions: false,
        },
      ],
      'object-shorthand': ['error', 'always'],
      'quote-props': ['error', 'consistent-as-needed'],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],

      // Node
      'n/no-unsupported-features/es-syntax': [
        'error',
        { version: `>=${nodeVersion}` },
      ],
      'n/no-extraneous-import': ['error'],
      'n/no-unpublished-import': ['error'],
      'n/prefer-node-protocol': ['error'],

      // Import
      'import/first': ['error'],
      'import/no-cycle': ['error', { ignoreExternal: true, disableScc: true }],
      'import/order': ['error'],
      'import/newline-after-import': ['error'],
      // import/no-unresolved can only check for .main fields, not the more
      // modern .exports fields.
      // We keep here a list of exceptions for packages we use that don't have a .main field.
      // See: https://github.com/import-js/eslint-plugin-import/issues/2132
      'import/no-unresolved': [
        'error',
        { ignore: ['lint-staged', '@octokit/rest'] },
      ],

      // JSDoc
      'jsdoc/check-param-names': ['warn'],
      'jsdoc/check-types': ['warn'],
      'jsdoc/no-undefined-types': ['warn'],
      'jsdoc/check-alignment': ['warn'],
      'jsdoc/check-examples': ['off'],
      'jsdoc/check-syntax': ['warn'],
      'jsdoc/check-tag-names': ['warn'],
      'jsdoc/require-jsdoc': ['warn'],
      'jsdoc/require-param': ['warn'],
      'jsdoc/require-param-description': ['warn'],
      'jsdoc/require-param-name': ['warn'],
      'jsdoc/require-param-type': ['warn'],
      'jsdoc/require-returns': ['warn'],
      'jsdoc/require-returns-check': ['warn'],
      'jsdoc/require-returns-description': ['warn'],
      'jsdoc/require-returns-type': ['warn'],
      'jsdoc/valid-types': ['warn'],

      // Prettier
      ...pluginPrettierRecommended.rules,
      // Prettier overwrites
      // quotes: We want `hello world` to be converted into 'hello world', but
      // Prettier doesn't do that, so we need to make eslint do it
      quotes: ['error', 'single', { avoidEscape: true }],
      'prettier/prettier': ['error', { singleQuote: true }],
    },
    settings: {
      // eslint-plugin-import doesn't currently support the "exports" syntax in
      // package.json. This is supposed to allow mapping between custom
      // entrypoints and files on disk.
      // For example, it doesn't understand "import * from 'vitest/config';" as
      // "vitest/config/" isn't really an existing filepath, but a mapping defined
      // in vitest package.json
      //
      // Until this is fixed (see
      // https://github.com/import-js/eslint-plugin-import/issues/2430)
      // we manually define all common extensions including React/TypeScript
      'import/resolver': {
        node: {
          extensions: ['.js', '.cjs', '.mjs', '.d.ts', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
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
  {
    name: 'aberlaas/react',
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/jsx-uses-react': ['error'],
      'react/jsx-uses-vars': ['error'],
      'import/extensions': ['error', 'always', { ignorePackages: true }],
    },
  },
  {
    name: 'aberlaas/scripts',
    files: ['**/scripts/**/*.{js,ts}'],
    rules: { 'no-process-exit': ['off'] },
  },
  {
    ignores: ['**/docs/**/*.js'],
  },
];
