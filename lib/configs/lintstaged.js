const pkg = require(`${process.cwd()}/package.json`);
const result = {
  'docs/**/*.md,.github/README.template.md': ['yarn run aberlaas readme'],
};
// Linting and autofixing supported files
if (pkg.scripts && pkg.scripts.lint) {
  result['*.css'] = ['yarn run lint:fix --css'];
  result['*.{yml,yaml}'] = ['yarn run lint:fix --yml'];
  result['.circleci/config.yml'] = ['yarn run lint --circleci'];
  result['*.json'] = ['yarn run lint:fix --json'];
  result['*.js'] = ['yarn run lint:fix --js'];
}
// Testing changed js files
if (pkg.scripts && pkg.scripts.test) {
  result['./lib/**/*.js'] = ['yarn run test --failFast --findRelatedTests'];
}
module.exports = result;
