const pkg = require(`${process.cwd()}/package.json`);
const result = {};
// Linting and autofixing supported files
if (pkg.scripts && pkg.scripts.lint) {
  result['*.css'] = ['./scripts/lint --css --fix'];
  result['*.{yml,yaml}'] = ['./scripts/lint --yml --fix'];
  result['.circleci/config.yml'] = ['./scripts/lint --circleci'];
  result['*.json'] = ['./scripts/lint --json --fix'];
  result['*.js'] = ['./scripts/lint --js --fix'];
}
// Testing changed js files
if (pkg.scripts && pkg.scripts.test) {
  result['./lib/**/*.js'] = ['./scripts/test --failFast --findRelatedTests'];
}
module.exports = result;
