import { absolute, remove, run, tmpDirectory } from 'firost';
import { _ } from 'golgoth';
import { setupLibDocsFixture } from '../test-helpers/index.js';

describe('hostWorkingDirectory, hostPackageRoot, hostGitRoot', () => {
  const testDirectory = tmpDirectory('aberlaas/helper');
  afterAll(async () => {
    await remove(testDirectory);
  });
  describe('in a libdocs layout', () => {
    beforeAll(async () => {
      // ./libdocs
      //   ./.git
      //   ./scripts
      //     ./test-helper.js
      //   ./lib
      //     ./helpers
      //     ./package.json
      //   ./docs
      //     ./assets
      //     ./package.json
      //   ./.yarnrc.yml
      //   ./package.json
      await setupLibDocsFixture(absolute(testDirectory, 'libdocs'));
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
      // run yarn test-helper
      const { stdout } = await run('yarn test-helper', {
        stdout: false,
        cwd: absolute(testDirectory, input),
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
