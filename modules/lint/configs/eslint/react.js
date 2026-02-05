import pluginReact from 'eslint-plugin-react';

export default [
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
];
