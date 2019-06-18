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
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:jest/recommended',
  ],
  plugins: ['import', 'jest', 'prettier'],
  settings: {
    'import/extensions': ['.js'],
  },
  rules: {
    'no-console': 0,
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // TODO: Should be updated to consistent-as-needed when
    // https://github.com/prettier/prettier/issues/6064 is fixed
    'quote-props': ['error', 'as-needed'],
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
    // Import
    'import/no-amd': ['error'],
    'import/no-commonjs': ['error'],
    'import/no-extraneous-dependencies': ['error'],
    'import/no-duplicates': ['error'],
    // Prettier
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 80,
      },
    ],
    // Jest
    'jest/no-empty-title': ['error'],
    'jest/no-test-prefixes': 0,
    'jest/prefer-called-with': ['error'],
    'jest/prefer-spy-on': ['error'],
    'jest/prefer-todo': ['error'],
    'jest/prefer-to-contain': ['error'],
    'jest/prefer-to-have-length': ['error'],
  },
};
