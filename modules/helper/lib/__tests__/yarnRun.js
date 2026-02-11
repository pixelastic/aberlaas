import { _ } from 'golgoth';
import {
  absolute,
  copy,
  gitRoot,
  mkdirp,
  move,
  readJson,
  remove,
  run,
  symlink,
  tmpDirectory,
  writeJson,
} from 'firost';
import { yarnVersion } from 'aberlaas-versions';

/**
 * Sets up a test fixture by copying fixture files, configuring package.json, creating git folder, and symlinking aberlaas
 * @param {string} rootPath - The directory path where the fixture will be set up
 * @param {string} fixtureType - module, libdocs or monorepo
 */
export async function setupFixture(rootPath, fixtureType) {
  // Setup the initial fixture
  const repoFixturePath = absolute(`../fixtures/${fixtureType}`);
  await copy(repoFixturePath, rootPath);

  // Rename _node_modules to node_modules
  // Note: We named it _node_modules because node_modules is gitignored
  await move(
    absolute(rootPath, '_node_modules'),
    absolute(rootPath, 'node_modules'),
  );

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
    absolute(gitRoot(), 'modules/lib/bin/aberlaas.js'),
  );
}

describe.slow('helper/yarnRun', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  afterAll(async () => {
    await remove(testDirectory);
  });
  describe.concurrent('in a module layout', () => {
    beforeAll(async () => {
      // ./module
      //   ./.git
      //   ./.yarn
      //     ./install-state.gz
      //   ./node_modules
      //     ./.bin
      //       ./aberlaas
      //   ./scripts
      //     ./test-helper.js
      //   ./.yarnrc.yml
      //   ./package.json
      //   ./yarn.lock
      await setupFixture(absolute(testDirectory, 'module'), 'module');
    });

    it.concurrent.each([
      [
        './module',
        {
          hostWorkingDirectory: './module',
          hostPackageRoot: './module',
          hostGitRoot: './module',
        },
      ],
      [
        './module/config',
        {
          hostWorkingDirectory: './module/config',
          hostPackageRoot: './module',
          hostGitRoot: './module',
        },
      ],
      [
        './module/lib',
        {
          hostWorkingDirectory: './module/lib',
          hostPackageRoot: './module',
          hostGitRoot: './module',
        },
      ],
      [
        './module/lib/helpers',
        {
          hostWorkingDirectory: './module/lib/helpers',
          hostPackageRoot: './module',
          hostGitRoot: './module',
        },
      ],
    ])('%s', async (input, expected) => {
      // Ensure cwd exists
      const cwd = absolute(testDirectory, input);
      await mkdirp(cwd);

      // run yarn test-helper
      const { stdout } = await run('yarn test-helper', {
        stdout: false,
        cwd,
      });
      // Parse output
      const actual = {};
      _.each(JSON.parse(stdout), (value, key) => {
        actual[key] = _.replace(value, testDirectory, '.');
      });

      expect(actual).toHaveProperty(
        'hostWorkingDirectory',
        expected.hostWorkingDirectory,
      );
      expect(actual).toHaveProperty(
        'hostPackageRoot',
        expected.hostPackageRoot,
      );
      expect(actual).toHaveProperty('hostGitRoot', expected.hostGitRoot);
    });
  });
  describe.concurrent('in a libdocs layout', () => {
    beforeAll(async () => {
      // ./libdocs
      //   ./.git
      //   ./.yarn
      //     ./install-state.gz
      //   ./node_modules
      //     ./.bin
      //       ./aberlaas
      //   ./scripts
      //     ./test-helper.js
      //   ./lib
      //     ./package.json
      //   ./docs
      //     ./package.json
      //   ./.yarnrc.yml
      //   ./package.json
      //   ./yarn.lock
      await setupFixture(absolute(testDirectory, 'libdocs'), 'libdocs');
    });

    it.concurrent.each([
      [
        './libdocs',
        {
          hostWorkingDirectory: './libdocs',
          hostPackageRoot: './libdocs',
          hostGitRoot: './libdocs',
        },
      ],
      [
        './libdocs/lib',
        {
          hostWorkingDirectory: './libdocs/lib',
          hostPackageRoot: './libdocs/lib',
          hostGitRoot: './libdocs',
        },
      ],
      [
        './libdocs/lib/helpers',
        {
          hostWorkingDirectory: './libdocs/lib/helpers',
          hostPackageRoot: './libdocs/lib',
          hostGitRoot: './libdocs',
        },
      ],
      [
        './libdocs/docs',
        {
          hostWorkingDirectory: './libdocs/docs',
          hostPackageRoot: './libdocs/docs',
          hostGitRoot: './libdocs',
        },
      ],
      [
        './libdocs/docs/assets',
        {
          hostWorkingDirectory: './libdocs/docs/assets',
          hostPackageRoot: './libdocs/docs',
          hostGitRoot: './libdocs',
        },
      ],
    ])('%s', async (input, expected) => {
      // Ensure cwd exists
      const cwd = absolute(testDirectory, input);
      await mkdirp(cwd);

      // run yarn test-helper
      const { stdout } = await run('yarn test-helper', {
        stdout: false,
        cwd,
      });

      // Parse output
      const actual = {};
      _.each(JSON.parse(stdout), (value, key) => {
        actual[key] = _.replace(value, testDirectory, '.');
      });

      expect(actual).toHaveProperty(
        'hostWorkingDirectory',
        expected.hostWorkingDirectory,
      );
      expect(actual).toHaveProperty(
        'hostPackageRoot',
        expected.hostPackageRoot,
      );
      expect(actual).toHaveProperty('hostGitRoot', expected.hostGitRoot);
    });
  });
  describe.concurrent('in a monorepo layout', () => {
    beforeAll(async () => {
      // ./monorepo
      //   ./.git
      //   ./.yarn
      //     ./install-state.gz
      //   ./node_modules
      //     ./bin
      //       ./aberlaas
      //   ./scripts
      //     ./test-helper.js
      //   ./modules
      //     ./alpha
      //       ./helpers
      //       ./package.json
      //     ./beta
      //       ./helpers
      //       ./package.json
      //     ./docs
      //       ./assets
      //       ./package.json
      //   ./.yarnrc.yml
      //   ./package.json
      //   ./yarn.lock
      await setupFixture(absolute(testDirectory, 'monorepo'), 'monorepo');
    });

    it.concurrent.each([
      [
        './monorepo',
        {
          hostWorkingDirectory: './monorepo',
          hostPackageRoot: './monorepo',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/config',
        {
          hostWorkingDirectory: './monorepo/config',
          hostPackageRoot: './monorepo',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules',
        {
          hostWorkingDirectory: './monorepo/modules',
          hostPackageRoot: './monorepo',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/alpha',
        {
          hostWorkingDirectory: './monorepo/modules/alpha',
          hostPackageRoot: './monorepo/modules/alpha',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/alpha/helpers',
        {
          hostWorkingDirectory: './monorepo/modules/alpha/helpers',
          hostPackageRoot: './monorepo/modules/alpha',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/beta',
        {
          hostWorkingDirectory: './monorepo/modules/beta',
          hostPackageRoot: './monorepo/modules/beta',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/beta/helpers',
        {
          hostWorkingDirectory: './monorepo/modules/beta/helpers',
          hostPackageRoot: './monorepo/modules/beta',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/docs',
        {
          hostWorkingDirectory: './monorepo/modules/docs',
          hostPackageRoot: './monorepo/modules/docs',
          hostGitRoot: './monorepo',
        },
      ],
      [
        './monorepo/modules/docs/assets',
        {
          hostWorkingDirectory: './monorepo/modules/docs/assets',
          hostPackageRoot: './monorepo/modules/docs',
          hostGitRoot: './monorepo',
        },
      ],
    ])('%s', async (input, expected) => {
      // Ensure cwd exists
      const cwd = absolute(testDirectory, input);
      await mkdirp(cwd);

      // run yarn test-helper
      const { stdout } = await run('yarn test-helper', {
        stdout: false,
        cwd,
      });

      // Parse output
      const actual = {};
      _.each(JSON.parse(stdout), (value, key) => {
        actual[key] = _.replace(value, testDirectory, '.');
      });

      expect(actual).toHaveProperty(
        'hostWorkingDirectory',
        expected.hostWorkingDirectory,
      );
      expect(actual).toHaveProperty(
        'hostPackageRoot',
        expected.hostPackageRoot,
      );
      expect(actual).toHaveProperty('hostGitRoot', expected.hostGitRoot);
    });
  });
});
