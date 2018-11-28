/* eslint-disable import/no-commonjs */
module.exports = {
  hooks: {
    'pre-commit': 'yarn run lint',
    'pre-push': 'yarn run test',
  },
};
