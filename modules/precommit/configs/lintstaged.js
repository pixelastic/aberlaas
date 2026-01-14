export default {
  // Lint
  '*.css': ['yarn run lint:fix --css'],
  '*.{yml,yaml}': ['yarn run lint:fix --yml'],
  '.circleci/config.yml': ['yarn run lint --circleci'],
  '*.json': ['yarn run lint:fix --json'],
  '*.js': ['yarn run lint:fix --js'],

  // Test
  './lib/**/*.js': ['FORCE_COLOR=1 yarn run test --failFast --related'],

  // Compress
  '*.png': ['yarn run compress --png'],

  // Documentation
  '*.md': ['yarn run aberlaas readme'],
};
