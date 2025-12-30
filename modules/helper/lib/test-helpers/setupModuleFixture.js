import { absolute, mkdirp, run, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';
import { scriptsTestHelperContent, yarnRcYmlContent } from './fixtures.js';

const rootPackageJson = {
  type: 'module',
  scripts: {
    'test-helper': 'node ./scripts/test-helper.js',
  },
  packageManager: `yarn@${yarnVersion}`,
};

/**
 * Setup a module fixture that looks like this:
 *
 * ./module
 *   ./.git
 *   ./config
 *   ./scripts
 *     ./test-helper.js
 *   ./lib
 *     ./helpers
 *   ./.yarnrc.yml
 *   ./package.json
 * @param {string} rootPath Path where to set the fixture
 */
export async function setupModuleFixture(rootPath) {
  // Git root
  await mkdirp(absolute(rootPath, '.git'));
  await mkdirp(absolute(rootPath, 'config'));
  await write(
    scriptsTestHelperContent,
    absolute(rootPath, 'scripts/test-helper.js'),
  );
  await write(yarnRcYmlContent, absolute(rootPath, '.yarnrc.yml'));
  await writeJson(rootPackageJson, absolute(rootPath, 'package.json'));

  // ./lib
  await mkdirp(absolute(rootPath, 'lib/helpers'));

  // yarn install
  await run('yarn install', { cwd: rootPath, stdout: false });
}
