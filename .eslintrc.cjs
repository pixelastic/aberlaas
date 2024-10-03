module.exports = {
  extends: ['./lib/configs/eslint.cjs'],
  overrides: [
    // Files in templates are trying to require('aberlaas/lib/*')
    // This works when copied into the root of a project as expected, but
    // not when inside the project itself as this path does not resolve
    {
      files: ['./lib/templates/*.js'],
      rules: {
        'n/no-missing-import': ['off'],
        'import/no-unresolved': ['off'],
      },
    },
  ],
};
