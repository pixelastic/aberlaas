const path = require('path');
const parentDir = path.resolve('..');
module.exports = {
  extends: ['./lib/configs/eslint.js'],
  overrides: [
    {
      files: ['./templates/*.js'],
      rules: {
        // Files in templates are trying to require('aberlaas/lib/*')
        // This works when copied into the root of a project as expected, but
        // not when inside the project itself as this path does not resolve
        // We prevent ESLint from throwing a linting error by adding the parent
        // directory of our local aberlaas code as one of the resolved path
        // This expect the main directory to be named "aberlaas", though
        'node/no-missing-require': [
          'error',
          {
            resolvePaths: [parentDir],
          },
        ],
      },
    },
  ],
};
