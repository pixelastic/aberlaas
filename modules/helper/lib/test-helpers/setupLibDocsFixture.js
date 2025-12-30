import { absolute, mkdirp, run, symlink, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';
import { scriptsTestHelperContent, yarnRcYmlContent } from './fixtures.js';

// Git Root {{{
const rootPackageJson = {
  type: 'module',
  workspaces: ['lib', 'docs'],
  scripts: {
    'test-helper': './scripts/test-helper',
  },
  packageManager: `yarn@${yarnVersion}`,
};
const modulePackageJson = {
  scripts: {
    'test-helper': 'cd .. && ./scripts/test-helper',
  },
};

/**
 * Setup a libdocs fixture that looks like this:
 *
 * ./libdocs
 *   ./.git
 *   ./node_modules
 *     ./bin
 *       ./aberlaas
 *   ./scripts
 *     ./test-helper.js
 *   ./lib
 *     ./helpers
 *     ./package.json
 *   ./docs
 *     ./assets
 *     ./package.json
 *   ./.yarnrc.yml
 *   ./package.json
 * @param {string} rootPath Path where to set the fixture
 */
export async function setupLibDocsFixture(rootPath) {
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
  await write(yarnRcYmlContent, absolute(rootPath, '.yarnrc.yml'));
  await writeJson(rootPackageJson, absolute(rootPath, 'package.json'));

  // ./lib
  await mkdirp(absolute(rootPath, 'lib/helpers'));
  await writeJson(modulePackageJson, absolute(rootPath, 'lib/package.json'));

  // ./docs
  await mkdirp(absolute(rootPath, 'docs/assets'));
  await writeJson(modulePackageJson, absolute(rootPath, 'docs/package.json'));

  // yarn install
  await run('yarn install', { cwd: rootPath, stdout: false });
}
