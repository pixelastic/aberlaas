import {
  absolute,
  mkdirp,
  remove,
  run,
  tmpDirectory,
  write,
  writeJson,
} from 'firost';
import { _ } from 'golgoth';

describe('hostWorkingDirectory, hostPackageRoot, hostGitRoot', () => {
  const testDirectory = tmpDirectory('aberlaas/helper');
  // const testDirectoryModule = absolute(testDirectory, 'module');
  const testDirectoryLibDocs = absolute(testDirectory, 'libdocs');
  afterAll(async () => {
    await remove(testDirectory);
  });
  describe('in a libdocs layout', () => {
    beforeAll(async () => {
      // ./libdocs
      //   ./.git
      //   ./lib
      //     ./package.json
      //     ./helpers
      //   ./docs
      //     ./package.json
      //     ./assets

      // Git root
      await mkdirp(absolute(testDirectoryLibDocs, '.git'));
      await writeJson(
        {
          name: 'test-helper-monorepo',
          type: 'module',
          workspaces: ['lib', 'docs'],
          scripts: {
            'test-helper': 'node ./scripts/test-helper.js',
          },
          packageManager: 'yarn@4.12.0',
        },
        absolute(testDirectoryLibDocs, 'package.json'),
      );
      await write(
        dedent`
          import helper from '${absolute('../main.js')}';

          console.log(
            JSON.stringify(
              {
                hostWorkingDirectory: helper.hostWorkingDirectory(),
                hostPackageRoot: helper.hostPackageRoot(),
                hostGitRoot: helper.hostGitRoot(),
                processCwd: process.cwd(),
              },
              null,
              2,
            ),
          );`,
        absolute(testDirectoryLibDocs, 'scripts/test-helper.js'),
      );
      await write(
        dedent`
          compressionLevel: 0
          defaultSemverRangePrefix: ''
          enableGlobalCache: true
          nodeLinker: node-modules
          nmMode: hardlinks-local
          nmHoistingLimits: workspaces
        `,
        absolute(testDirectoryLibDocs, '.yarnrc.yml'),
      );

      // ./lib
      await writeJson(
        {
          name: 'test-helper-lib',
          scripts: {
            'test-helper': 'node ../scripts/test-helper.js',
          },
        },
        absolute(testDirectoryLibDocs, 'lib/package.json'),
      );
      await mkdirp(absolute(testDirectoryLibDocs, 'lib/helpers'));

      // ./docs
      await writeJson(
        {
          name: 'test-helper-docs',
          scripts: {
            'test-helper': 'node ../scripts/test-helper.js',
          },
        },
        absolute(testDirectoryLibDocs, 'docs/package.json'),
      );
      await mkdirp(absolute(testDirectoryLibDocs, 'docs/assets'));

      // yarn install
      await run('yarn install', { cwd: testDirectoryLibDocs, stdout: false });
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
