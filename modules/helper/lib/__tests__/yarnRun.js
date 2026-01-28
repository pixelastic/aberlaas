import { absolute, mkdirp, remove, run, tmpDirectory } from 'firost';
import { _ } from 'golgoth';
import { setupFixture } from '../test-helper.js';

describe('hostWorkingDirectory, hostPackageRoot, hostGitRoot', () => {
  vi.setConfig({ testTimeout: 10_000 });

  const testDirectory = tmpDirectory('aberlaas/helper');
  afterAll(async () => {
    await remove(testDirectory);
  });
  describe('in a module layout', () => {
    beforeAll(async () => {
      await setupFixture(absolute(testDirectory, 'module'), 'module');
    });

    it.each([
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
  describe('in a libdocs layout', () => {
    beforeAll(async () => {
      await setupFixture(absolute(testDirectory, 'libdocs'), 'libdocs');
    });

    it.each([
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
  describe('in a monorepo layout', () => {
    beforeAll(async () => {
      await setupFixture(absolute(testDirectory, 'monorepo'), 'monorepo');
    });

    it.each([
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
