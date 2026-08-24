import pluginToml from 'eslint-plugin-toml';

export default [
  {
    name: 'aberlaas/toml',
    files: ['**/*.toml'],
    plugins: {
      toml: pluginToml,
    },
    language: 'toml/toml',
    rules: {
      'toml/indent': ['error'],
      'toml/keys-order': ['error'],
      'toml/no-space-dots': ['error'],
      'toml/no-unreadable-number-separator': ['error'],
      'toml/padding-line-between-pairs': ['error'],
      'toml/padding-line-between-tables': ['error'],
      'toml/precision-of-fractional-seconds': ['error'],
      'toml/precision-of-integer': ['error'],
      'toml/quoted-keys': ['error'],
      'toml/tables-order': ['error'],
      'toml/vue-custom-block/no-parsing-error': ['error'],
      'toml/array-bracket-newline': ['error'],
      'toml/array-bracket-spacing': ['error'],
      'toml/array-element-newline': ['error'],
      'toml/comma-style': ['error'],
      'toml/inline-table-curly-newline': ['error'],
      'toml/inline-table-curly-spacing': ['error'],
      'toml/inline-table-key-value-newline': ['error'],
      'toml/key-spacing': ['error'],
      'toml/spaced-comment': ['error'],
      'toml/table-bracket-spacing': ['error'],

      // Non-standard rules
      'toml/no-mixed-type-in-array': ['off'],
      'toml/no-non-decimal-integer': ['off'],
    },
  },
];
