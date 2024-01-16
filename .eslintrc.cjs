module.exports = {
  extends: ['./lib/configs/eslint.cjs'],
  overrides: [
    {
      files: ['**/templates/*.js'],
      rules: {
        // Files in templates are trying to require('aberlaas/lib/*')
        // This works when copied into the root of a project as expected, but
        // not when inside the project itself as this path does not resolve
        'n/no-missing-import': ['off'],
      },
    },
  ],
};
