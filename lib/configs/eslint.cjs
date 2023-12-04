const nodeConfig = require('./node.cjs');
module.exports = {
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:n/recommended',
    'plugin:prettier/recommended',
  ],
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
    // // TODO: Should be updated to consistent-as-needed when
    // // https://github.com/prettier/prettier/issues/6064 is fixed
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true }],
    // Node
    'n/no-unsupported-features/es-syntax': [
      'error',
      {
        version: `>=${nodeConfig.nodeVersion}`,
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
        testName: false,
        // Shorter method names
        fit: false,
        ftest: false,
        fdescribe: false,
        xit: false,
        xtest: false,
        xdescribe: false,

        captureOutput: false,
        dedent: false,
      },
      plugins: ['vitest'],
      extends: [
        'plugin:vitest/recommended',
        'plugin:vitest-globals/recommended',
      ],
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
