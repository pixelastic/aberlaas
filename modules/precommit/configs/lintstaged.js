export const commands = {
  lintCss: 'yarn run lint:fix --css',
  lintYml: 'yarn run lint:fix --yml',
  lintCircleci: 'yarn run lint --circleci',
  lintJson: 'yarn run lint:fix --json',
  lintJs: 'yarn run lint:fix --js',
  testJs: 'yarn run test --failFast --related',
  compressPng: 'yarn run compress --png',
  readme: 'yarn run aberlaas readme --add-to-git',
};

export default {
  // Lint
  '**/*.css': [commands.lintCss],
  '**/*.{yml,yaml}': [commands.lintYml],
  '.circleci/config.yml': [commands.lintCircleci],
  '**/*.json': [commands.lintJson],
  '**/*.js': [commands.lintJs],

  // Test
  '**/lib/**/*.js': [commands.testJs],

  // Compress
  '**/*.png': [commands.compressPng],

  // Documentation
  '**/*.md': [commands.readme],
};
