const nodeConfig = require('./node');
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    // Additional Jest globals added by Aberlaas
    testName: false,
    captureOutput: false,
    dedent: false,
  },
  plugins: ['jest', 'jsdoc', 'prettier'],
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
    // TODO: Should be updated to consistent-as-needed when
    // https://github.com/prettier/prettier/issues/6064 is fixed
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true }],
    // Node
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        version: `>=${nodeConfig.nodeVersion}`,
      },
    ],
    'node/no-unsupported-features/node-builtins': [
      'error',
      {
        version: `>=${nodeConfig.nodeVersion}`,
      },
    ],
    // Jest
    'jest/expect-expect': ['error'],
    'jest/no-test-prefixes': 0,
    'jest/prefer-called-with': 0,
    'jest/prefer-spy-on': ['error'],
    'jest/prefer-todo': 0,
    'jest/prefer-to-contain': ['error'],
    'jest/prefer-to-have-length': ['error'],
    'jest/valid-title': ['error'],
    // JSDoc
    'jsdoc/check-param-names': ['warn'],
    'jsdoc/check-types': ['warn'],
    'jsdoc/no-undefined-types': ['warn'],
    'jsdoc/check-alignment': ['warn'],
    'jsdoc/check-examples': ['warn'],
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
