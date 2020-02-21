
const pkg = require(`${process.cwd()}/package.json`);
const result = {};
// Linting and autofixing supported files
if (pkg.scripts && pkg.scripts.lint) {
  result['*.css'] = ['./scripts/lint --css --fix', 'git add'];
  result['*.yml'] = ['./scripts/lint --yml --fix', 'git add'];
  result['.circleci/config.yml'] = ['./scripts/lint --circleci'];
  result['*.json'] = ['./scripts/lint --json --fix', 'git add'];
  result['*.js'] = ['./scripts/lint --js --fix', 'git add'];
}
// Testing changed js files
if (pkg.scripts && pkg.scripts.test) {
  result['./lib/**/*.js'] = ['./scripts/test --failFast --findRelatedTests'];
}
module.exports = result;