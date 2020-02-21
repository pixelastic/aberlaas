
module.exports = {
  extends: ['./lib/configs/eslint.js'],
  overrides: [
    {
      files: ['./templates/*.js'],
      rules: {
        // Allow importing files from aberlaas/ in templates
        // It is expected to fail in dev, but will correctly resolve once copied
        // to the host project
        'import/no-unresolved': [
          'error',
          {
            commonjs: true,
            ignore: ['^aberlaas/'],
          },
        ],
      },
    },
  ],
};