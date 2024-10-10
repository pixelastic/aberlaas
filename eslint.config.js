import config from 'aberlaas/configs/eslint';

export default [
  ...config,
  {
    // Files in templates are trying to import from 'aberlaas/configs/eslint'
    // This works when copied into the root of a project as expected, but
    // not when inside the project itself as this path does not resolve
    files: ['lib/templates/**/*.js'],
    rules: {
      'import/no-unresolved': ['off'],
    },
  },
];
