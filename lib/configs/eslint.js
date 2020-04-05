module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  // parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    //   sourceType: 'module',
    //   ecmaFeatures: {
    //     impliedStrict: true,
    //     jsx: true,
    //   },
  },
  extends: [
    'eslint:recommended',
    // 'plugin:import/errors',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    // Additional Jest globals added by Aberlaas
    testName: false,
    captureOutput: false,
  },
  plugins: ['import', 'jest', 'jsdoc', 'prettier'],
  settings: {
    'import/extensions': ['.js'],
    // Don't try to parse those files
    // but still warn if they don't exist
    'import/ignore': ['.pug$'],
  },
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
    // Import
    // 'import/no-amd': ['error'],
    // 'import/no-commonjs': ['error'],
    // 'import/no-duplicates': ['error'],
    // 'import/no-extraneous-dependencies': ['error'],
    // 'import/no-unresolved': ['error', { commonjs: true }],
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
};
