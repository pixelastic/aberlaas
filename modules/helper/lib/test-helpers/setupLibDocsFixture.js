import { absolute, mkdirp, run, write, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';
import { scriptsTestHelperContent, yarnRcYmlContent } from './fixtures.js';

// Git Root {{{
const rootPackageJson = {
  type: 'module',
  workspaces: ['lib', 'docs'],
  scripts: {
    'test-helper': 'node ./scripts/test-helper.js',
  },
  packageManager: `yarn@${yarnVersion}`,
};
const modulePackageJson = {
  scripts: {
    'test-helper': 'node ../scripts/test-helper.js',
  },
};

/**
 * Setup a libdocs fixture that looks like this:
 *
 * ./libdocs
 *   ./.git
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
  await write(
    scriptsTestHelperContent,
    absolute(rootPath, 'scripts/test-helper.js'),
  );
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
