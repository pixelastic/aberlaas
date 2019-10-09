/* eslint-disable import/no-commonjs */
const pkg = require(`${process.cwd()}/package.json`);
const result = {};
// Linting and autofixing supported files
if (pkg.scripts && pkg.scripts.lint) {
  result['*.css'] = ['yarn run lint --css --fix', 'git add'];
  result['*.yml'] = ['yarn run lint --yml --fix', 'git add'];
  result['*.json'] = ['yarn run lint --json --fix', 'git add'];
  result['*.js'] = ['yarn run lint --js --fix', 'git add'];
}
// Testing changed js files
if (pkg.scripts && pkg.scripts.test) {
  result['./lib/**/*.js'] = ['yarn run test --failFast --findRelatedTests'];
}
module.exports = result;
