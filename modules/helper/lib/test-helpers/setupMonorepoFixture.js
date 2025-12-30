import { absolute, mkdirp, run, symlink, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';
import { scriptsTestHelperContent, yarnRcYmlContent } from './fixtures.js';

const rootPackageJson = {
  type: 'module',
  workspaces: ['modules/*'],
  scripts: {
    'test-helper': './scripts/test-helper',
  },
  packageManager: `yarn@${yarnVersion}`,
};
const modulePackageJson = {
  scripts: {
    'test-helper': 'cd ../../ && ./scripts/test-helper',
  },
};

/**
 * Setup a monorepo fixture that looks like this:
 *
 * ./monorepo
 *   ./.git
 *   ./config
 *   ./node_modules
 *     ./bin
 *       ./aberlaas
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
  await symlink(
    absolute(rootPath, 'node_modules/.bin/aberlaas'),
    absolute('<gitRoot>/modules/lib/bin/aberlaas.js'),
  );
  await write(
    scriptsTestHelperContent,
    absolute(rootPath, 'scripts/test-helper'),
  );
  await run('chmod +x scripts/test-helper', { cwd: rootPath });
  await mkdirp(absolute(rootPath, 'config'));
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
