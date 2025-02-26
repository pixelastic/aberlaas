import config from './modules/lib/configs/eslint.js';

export default [
  ...config,
  {
    // Files in templates are trying to import from 'aberlaas/configs/*'
    // This works when copied into the root of a project as expected, because
    // aberlaas is then available, but fails when inside the project itself as
    // aberlaas is not a direct dependency of aberlaas-init
    files: ['**/modules/init/templates/**/*.js'],
    rules: {
      'n/no-extraneous-import': ['off'],
    },
  },
];
