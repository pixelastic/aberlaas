import { _ } from 'golgoth';
import micromatch from 'micromatch';
import {
  commands,
  default as lintStagedConfig,
} from '../../configs/lintstaged.js';

/**
 * Helper to get the list of all commands that would be called on a specific filepath
 * @param {string} filepath - The file path to match against configured patterns
 * @returns {Array} Array of commands that should be executed for the given file
 */
function getCommandsForFile(filepath) {
  return (
    _.chain(lintStagedConfig)
      .keys()
      // Note: lint-staged activates dot: true automatically
      .filter((pattern) => micromatch.isMatch(filepath, pattern, { dot: true }))
      .flatMap((pattern) => lintStagedConfig[pattern])
      .value()
  );
}

describe('precommit/lintstaged-config', () => {
  it.each([
    // JavaScript
    ['lib/main.js', [commands.lintJs, commands.testJs]],
    ['lib/helper/index.js', [commands.lintJs, commands.testJs]],
    ['eslint.config.js', [commands.lintJs]],
    ['scripts/update-stuff.js', [commands.lintJs]],

    // JSON
    ['package.json', [commands.lintJson]],
    ['lib/package.json', [commands.lintJson]],
    ['modules/docs/package.json', [commands.lintJson]],
    ['.github/renovate.json', [commands.lintJson]],
    ['data/something.json', [commands.lintJson]],

    // CSS
    ['docs/assets/style.css', [commands.lintCss]],

    // YML
    ['.github/workflow/ci.yml', [commands.lintYml]],
    ['.github/workflow/ci.yaml', [commands.lintYml]],
    ['.circleci/config.yml', [commands.lintYml, commands.lintCircleci]],

    // PNG
    ['docs/assets/logo.png', [commands.compressPng]],
    ['screenshot.png', [commands.compressPng]],

    // README
    ['README.md', [commands.readme]],
    ['LICENSE.md', [commands.readme]],
    ['docs/method.md', [commands.readme]],
    ['lib/README.md', [commands.readme]],
  ])('%s', (input, expected) => {
    const actual = getCommandsForFile(input);

    expect(actual).toEqual(expected);
  });
});
