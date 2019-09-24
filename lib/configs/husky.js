/* eslint-disable import/no-commonjs */
const pkg = require(`${process.cwd()}/package.json`);
const hooks = {};
if (pkg.scripts && pkg.scripts.lint) {
  hooks['pre-commit'] = 'yarn run lint';
}
if (pkg.scripts && pkg.scripts.test) {
  hooks['pre-push'] = 'yarn run test';
}
module.exports = {
  hooks,
};
