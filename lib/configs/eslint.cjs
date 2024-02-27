// Note: ESLint doesn't support ESM configuration as of 2024-02-19. This file
// needs to stay as a CommonJS file
const nodeConfig = require('./node.cjs');
module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  extends: [
    'eslint:recommended',
    'plugin:n/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    // eslint-plugin-import doesn't currently support the "exports" syntax in
    // package.json. This allow mapping between custom entrypoints and
    // files on disk.
    // For example, it doesn't understand "import * from 'vitest/config';" as
    // "vitest/config/" isn't really an existing filepath, but a mapping defined
    // in vitest package.json
    //
    // Until this is fixed (see
    // https://github.com/import-js/eslint-plugin-import/issues/2430)
    // we manually define the most common extensions
    'import/resolver': {
      node: {
        extensions: ['.js', '.cjs', '.mjs', '.d.ts'],
      },
    },
  },
  plugins: ['jsdoc', 'prettier'],
  rules: {
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
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_.',
        varsIgnorePattern: '^_.',
      },
    ],
    'no-shadow': ['error'],
    'object-shorthand': ['error', 'always'],
    // TODO: Should be updated to consistent-as-needed when
    // https://github.com/prettier/prettier/issues/6064 is fixed
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true }],
    // Node
    'n/no-unsupported-features/es-syntax': [
      'error',
      {
        version: `>=${nodeConfig.nodeVersion}`,
      },
    ],
    // Import
    'import/no-cycle': ['error'],
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
    'prettier/prettier': 'error',
  },
  overrides: [
    // Vitest
    {
      files: ['**/__tests__/**/*.js'],
      env: {
        'vitest-globals/env': true,
      },
      globals: {
        // Test name
        testName: false,
        // Shorter method names
        fit: false,
        fdescribe: false,
        xit: false,
        xdescribe: false,

        captureOutput: false,
        dedent: false,
      },
      extends: [
        'plugin:vitest/recommended',
        'plugin:vitest-globals/recommended',
      ],
      rules: {
        'no-restricted-globals': [
          'error',
          {
            name: 'fit',
            message: 'No focused test',
          },
          {
            name: 'fdescribe',
            message: 'No focused tests',
          },
          {
            name: 'xit',
            message: 'No skipped test',
          },
          {
            name: 'xdescribe',
            message: 'No skipped tests',
          },
        ],
        'vitest/consistent-test-it': ['warn', { fn: 'it' }],
        // Disabling vitest/no-identical-title
        // It can make eslint crash when used with fit/xit/fdescribe/xdescribe
        // See: https://github.com/veritem/eslint-plugin-vitest/issues/310
        'vitest/no-identical-title': ['off'],
        'vitest/prefer-to-contain': ['error'],
      },
    },
    // no-process-exit
    // We need to send clear exit codes in yarn run scripts
    {
      files: ['**/scripts/**/*.js'],
      rules: {
        'no-process-exit': ['off'],
      },
    },
  ],
};
