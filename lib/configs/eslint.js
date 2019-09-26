/* eslint-disable import/no-commonjs */
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['import', 'jest', 'jsdoc', 'prettier'],
  settings: {
    'import/extensions': ['.js'],
    // Don't try to parse those files
    // but still warn if they don't exist
    'import/ignore': ['.pug$'],
  },
  rules: {
    'max-len': [
      'error',
      {
        code: 80,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        // Ignore long lines in test headers, allowing us to write descriptive
        // tests
        ignorePattern: '^\\s*it\\(',
      },
    ],
    'no-console': ['off'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'object-shorthand': ['error', 'always'],
    // TODO: Should be updated to consistent-as-needed when
    // https://github.com/prettier/prettier/issues/6064 is fixed
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true }],
    // Import
    'import/no-amd': ['error'],
    'import/no-commonjs': ['error'],
    'import/no-extraneous-dependencies': ['error'],
    'import/no-duplicates': ['error'],
    // Jest
    'jest/no-empty-title': ['error'],
    'jest/no-test-prefixes': 0,
    'jest/prefer-called-with': 0,
    'jest/prefer-spy-on': ['error'],
    'jest/prefer-todo': 0,
    'jest/prefer-to-contain': ['error'],
    'jest/prefer-to-have-length': ['error'],
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
};
