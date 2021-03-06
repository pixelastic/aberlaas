module.exports = {
  extends: ['./lib/configs/eslint.js'],
  overrides: [
    {
      files: ['./templates/*.js'],
      rules: {
        // Files in templates are trying to require('aberlaas/lib/*')
        // This works when copied into the root of a project as expected, but
        // not when inside the project itself as this path does not resolve
        'node/no-missing-require': [0],
        'node/no-extraneous-require': [0],
      },
    },
  ],
};
