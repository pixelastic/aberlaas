import { absolute, mkdirp, run, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';
import { scriptsTestHelperContent, yarnRcYmlContent } from './fixtures.js';

const rootPackageJson = {
  type: 'module',
  workspaces: ['modules/*'],
  scripts: {
    'test-helper': 'node ./scripts/test-helper.js',
  },
  packageManager: `yarn@${yarnVersion}`,
};
const modulePackageJson = {
  scripts: {
    'test-helper': 'node ../../scripts/test-helper.js',
  },
};

/**
 * Setup a monorepo fixture that looks like this:
 *
 * ./monorepo
 *   ./.git
 *   ./config
 *   ./scripts
 *     ./test-helper.js
 *   ./modules
 *     ./alpha
 *       ./helpers
 *       ./package.json
 *     ./beta
 *       ./helpers
 *       ./package.json
 *     ./docs
 *       ./assets
 *       ./package.json
 *   ./.yarnrc.yml
 *   ./package.json
 * @param {string} rootPath Path where to set the fixture
 */
export async function setupMonorepoFixture(rootPath) {
  // Git root
  await mkdirp(absolute(rootPath, '.git'));
  await mkdirp(absolute(rootPath, 'config'));
  await write(
    scriptsTestHelperContent,
    absolute(rootPath, 'scripts/test-helper.js'),
  );
  await write(yarnRcYmlContent, absolute(rootPath, '.yarnrc.yml'));
  await writeJson(rootPackageJson, absolute(rootPath, 'package.json'));

  // ./modules
  await mkdirp(absolute(rootPath, 'modules/alpha/helpers'));
  await writeJson(
    modulePackageJson,
    absolute(rootPath, 'modules/alpha/package.json'),
  );

  await mkdirp(absolute(rootPath, 'modules/beta/helpers'));
  await writeJson(
    modulePackageJson,
    absolute(rootPath, 'modules/beta/package.json'),
  );

  await mkdirp(absolute(rootPath, 'modules/docs/assets'));
  await writeJson(
    modulePackageJson,
    absolute(rootPath, 'modules/docs/package.json'),
  );

  // yarn install
  await run('yarn install', { cwd: rootPath, stdout: false });
}
