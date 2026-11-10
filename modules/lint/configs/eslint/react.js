export default [
  {
    name: 'aberlaas/react',
    files: ['**/*.{jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'import-x/extensions': ['error', 'always', { ignorePackages: true }],
    },
  },
];
