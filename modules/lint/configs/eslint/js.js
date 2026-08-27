import js from '@eslint/js';
import { nodeVersion } from 'aberlaas-versions';
import pluginImport from 'eslint-plugin-import';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginN from 'eslint-plugin-n';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ruleNoAbbreviatedNames from './rules/js/no-abbreviated-names.js';
import ruleNoExclusionaryTerms from './rules/js/no-exclusionary-terms.js';
import rulePreferLodashChain from './rules/js/prefer-lodash-chain.js';
import rulePreferLodashIsEmpty from './rules/js/prefer-lodash-is-empty.js';
import rulePreferLodashMethods from './rules/js/prefer-lodash-methods.js';
import rulePrivateMethodsNoJsdocOnProxy from './rules/js/private-methods-no-jsdoc-on-proxy.js';
import rulePrivateMethodsNoRename from './rules/js/private-methods-no-rename.js';
import rulePrivateMethodsNoWrapper from './rules/js/private-methods-no-wrapper.js';
import rulePrivateMethodsOrdering from './rules/js/private-methods-ordering.js';
import ruleTestFileNaming from './rules/js/test-file-naming.js';

export default [
  {
    name: 'aberlaas/base',
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
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
      aberlaas: {
        rules: {
          'no-abbreviated-names': ruleNoAbbreviatedNames,
          'no-exclusionary-terms': ruleNoExclusionaryTerms,
          'prefer-lodash-chain': rulePreferLodashChain,
          'prefer-lodash-is-empty': rulePreferLodashIsEmpty,
          'prefer-lodash-methods': rulePreferLodashMethods,
          'private-methods-no-jsdoc-on-proxy': rulePrivateMethodsNoJsdocOnProxy,
          'private-methods-no-rename': rulePrivateMethodsNoRename,
          'private-methods-no-wrapper': rulePrivateMethodsNoWrapper,
          'private-methods-ordering': rulePrivateMethodsOrdering,
          'test-file-naming': ruleTestFileNaming,
        },
      },
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
      eqeqeq: ['error'],
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
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Set']",
          message: 'Use arrays; use _.uniq() for deduplication',
        },
        {
          selector: "CallExpression[callee.name='Set']",
          message: 'Use arrays; use _.uniq() for deduplication',
        },
        {
          selector: "MemberExpression[object.name='Set']",
          message: 'Use arrays; use _.uniq() for deduplication',
        },
        {
          selector: "NewExpression[callee.name='WeakSet']",
          message: 'Use arrays; use _.uniq() for deduplication',
        },
        {
          selector: "CallExpression[callee.name='WeakSet']",
          message: 'Use arrays; use _.uniq() for deduplication',
        },
        {
          selector: "MemberExpression[object.name='WeakSet']",
          message: 'Use arrays; use _.uniq() for deduplication',
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
      'import/no-unresolved': ['error'],

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

      // Aberlaas custom rules
      'aberlaas/no-abbreviated-names': ['error'],
      'aberlaas/no-exclusionary-terms': ['error'],
      'aberlaas/prefer-lodash-chain': ['error'],
      'aberlaas/prefer-lodash-is-empty': ['error'],
      'aberlaas/prefer-lodash-methods': ['error'],
      'aberlaas/private-methods-no-jsdoc-on-proxy': ['error'],
      'aberlaas/private-methods-no-rename': ['error'],
      'aberlaas/private-methods-no-wrapper': ['error'],
      'aberlaas/private-methods-ordering': ['error'],
      'aberlaas/test-file-naming': ['error'],
    },
    settings: {
      'import/resolver': {
        exports: {},
        node: {
          extensions: ['.js', '.cjs', '.mjs', '.d.ts', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
