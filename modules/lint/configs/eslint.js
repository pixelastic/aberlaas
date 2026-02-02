import js from '@eslint/js';
import pluginJson from '@eslint/json';
// @vitest/plugins requires @typescript-eslint/utils and typescripts as deps
// See: https://github.com/vitest-dev/eslint-plugin-vitest/issues/543
import pluginVitest from '@vitest/eslint-plugin';
import { nodeVersion } from 'aberlaas-versions';
import pluginImport from 'eslint-plugin-import';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginN from 'eslint-plugin-n';
import packageJson from 'eslint-plugin-package-json';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';

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
          property: 'contain',
          message: 'Typo: Use _.includes instead',
        },
        {
          object: '_',
          property: 'include',
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
      // Put most common modules (firost, golgoth, etc) first
      // Then other third parties
      // Then internal files
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: 'golgoth',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'firost',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/newline-after-import': ['error'],
      // import/no-unresolved can only check for .main fields, not the more
      // modern .exports fields.
      // We keep here a list of exceptions for packages we use that don't have a .main field.
      // See: https://github.com/import-js/eslint-plugin-import/issues/2132
      'import/no-unresolved': [
        'error',
        {
          ignore: ['changelogen', 'lint-staged', '@octokit/rest', 'stylelint'],
        },
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
    name: 'aberlaas/json',
    plugins: {
      json: pluginJson,
    },
    language: 'json/json',
    files: ['**/*.json'],
    ignores: ['**/package.json'],
    rules: {
      'json/no-duplicate-keys': ['error'],
      'json/no-empty-keys': ['error'],
      'json/no-unnormalized-keys': ['error'],
      'json/no-unsafe-values': ['error'],
      'json/top-level-interop': ['error'],
      'json/sort-keys': ['off'],
    },
  },
  {
    name: 'eslint-package/package-json',
    plugins: {
      'package-json': packageJson,
    },
    languageOptions: {
      parser: jsoncParser,
    },
    files: ['**/package.json'],
    rules: {
      // Recommended rules
      'package-json/require-description': ['error'],
      'package-json/require-license': ['error'],
      'package-json/require-name': ['error'],
      'package-json/require-type': ['error'],
      'package-json/require-version': ['error'],
      'package-json/no-empty-fields': ['error'],
      'package-json/no-redundant-files': ['error'],
      'package-json/no-redundant-publishConfig': ['error'],
      'package-json/repository-shorthand': ['error'],
      'package-json/sort-collections': ['error'],
      'package-json/specify-peers-locally': ['error'],
      'package-json/unique-dependencies': ['error'],
      'package-json/valid-author': ['error'],
      'package-json/valid-bin': ['error'],
      'package-json/valid-bundleDependencies': ['error'],
      'package-json/valid-config': ['error'],
      'package-json/valid-contributors': ['error'],
      'package-json/valid-cpu': ['error'],
      'package-json/valid-dependencies': ['error'],
      'package-json/valid-description': ['error'],
      'package-json/valid-devDependencies': ['error'],
      'package-json/valid-directories': ['error'],
      'package-json/valid-engines': ['error'],
      'package-json/valid-exports': ['error'],
      'package-json/valid-files': ['error'],
      'package-json/valid-homepage': ['error'],
      'package-json/valid-keywords': ['error'],
      'package-json/valid-license': ['error'],
      'package-json/valid-main': ['error'],
      'package-json/valid-man': ['error'],
      'package-json/valid-module': ['error'],
      'package-json/valid-name': ['error'],
      'package-json/valid-optionalDependencies': ['error'],
      'package-json/valid-os': ['error'],
      'package-json/valid-peerDependencies': ['error'],
      'package-json/valid-private': ['error'],
      // Publishable-only
      'package-json/require-attribution': ['error'],
      'package-json/require-exports': ['error'],
      'package-json/require-files': ['error'],
      'package-json/require-repository': ['error'],
      'package-json/require-sideEffects': ['error'],
      // Stylistic rules
      'package-json/bin-name-casing': ['error'],
      'package-json/exports-subpaths-style': ['error'],
      'package-json/order-properties': [
        'error',
        {
          // See: https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/order-properties.md
          order: [
            // Name
            'name',
            'version',
            // Dev info
            'private',
            'workspaces',
            // Metadata
            'description',
            'author',
            'homepage',
            'keywords',
            'repository',
            // Compatibility
            'type',
            'sideEffects',
            'license',
            'engines',
            'packageManager',
            // Exports
            'files',
            'exports',
            'main',
            // Dependencies
            'devDependencies',
            'dependencies',
            'peerDependencies',
            // Scripts
            'scripts',
          ],
        },
      ],
      'package-json/scripts-name-casing': ['error'],
      // Deprecated rules
      'package-json/valid-package-definition': ['off'],
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
