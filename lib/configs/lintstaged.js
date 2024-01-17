// const pkg = require(`${process.cwd()}/package.json`);

// // We update the README.md and ./lib/README.md whenever documentation changes
// const aberlaasRunCommands = [
//   'yarn run aberlaas readme',
//   'git add ./README.md ./lib/README.md',
// ];
// const result = {
//   '.github/README.template.md': aberlaasRunCommands,
//   'docs/src/**/*.md': aberlaasRunCommands,
// };

// // Linting and autofixing supported files
// if (pkg.scripts && pkg.scripts.lint) {
//   result['*.css'] = ['yarn run lint:fix --css'];
//   result['*.{yml,yaml}'] = ['yarn run lint:fix --yml'];
//   result['.circleci/config.yml'] = ['yarn run lint --circleci'];
//   result['*.json'] = ['yarn run lint:fix --json'];
//   result['*.js'] = ['yarn run lint:fix --js'];
// }

// // Compressing images
// if (pkg.scripts && pkg.scripts.compress) {
//   result['*.png'] = ['yarn run compress --png'];
// }

// // Testing changed js files
// if (pkg.scripts && pkg.scripts.test) {
//   result['./lib/**/*.js'] = ['yarn run test --failFast --related'];
// }
// module.exports = result;

console.info('config');
export default async (allStagedFiles) => {
  console.info(allStagedFiles);
  return ['echo blabla', 'false'];
};
