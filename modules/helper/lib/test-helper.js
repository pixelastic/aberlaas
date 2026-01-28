import { absolute, copy, mkdirp, readJson, symlink, writeJson } from 'firost';
import { yarnVersion } from 'aberlaas-versions';

/**
 * Potential fixtures look like this:
 *
 * ===== MODULE =====
 * ./module
 *   ./.git
 *   ./.yarn
 *     ./install-state.gz
 *   ./node_modules
 *     ./.bin
 *       ./aberlaas
 *   ./scripts
 *     ./test-helper.js
 *   ./.yarnrc.yml
 *   ./package.json
 *   ./yarn.lock
 *
 * ===== LIBDOCS =====
 * ./libdocs
 *   ./.git
 *   ./.yarn
 *     ./install-state.gz
 *   ./node_modules
 *     ./.bin
 *       ./aberlaas
 *   ./scripts
 *     ./test-helper.js
 *   ./lib
 *     ./package.json
 *   ./docs
 *     ./package.json
 *   ./.yarnrc.yml
 *   ./package.json
 *   ./yarn.lock
 *
 * ===== MONOREPO =====
 * ./monorepo
 *   ./.git
 *   ./.yarn
 *     ./install-state.gz
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
 *   ./yarn.lock
 */

/**
 * Sets up a test fixture by copying fixture files, configuring package.json, creating git folder, and symlinking aberlaas
 * @param {string} rootPath - The directory path where the fixture will be set up
 * @param {string} fixtureType - module, libdocs or monorepo
 */
export async function setupFixture(rootPath, fixtureType) {
  // Setup the initial fixture
  const repoFixturePath = absolute(`./fixtures/${fixtureType}`);
  await copy(repoFixturePath, rootPath);

  // Set the exact yarn version used by aberlaas
  const packagePath = absolute(rootPath, 'package.json');
  const packageContent = await readJson(packagePath);
  packageContent.packageManager = `yarn@${yarnVersion}`;
  await writeJson(packageContent, packagePath);

  // We create a fake .git folder
  // Note: We don't put it in the fixture as it might confuse git
  await mkdirp(absolute(rootPath, '.git'));

  // We add a symlink to simulate aberlaas being installed
  // Note: We don't put it in the fixture as we need the absolute path
  await symlink(
    absolute(rootPath, 'node_modules/.bin/aberlaas'),
    absolute('<gitRoot>/modules/lib/bin/aberlaas.js'),
  );
}
