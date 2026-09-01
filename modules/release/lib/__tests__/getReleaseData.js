import { remove, tmpDirectory, write, writeJson } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __, getReleaseData } from '../getReleaseData.js';

describe('release/getReleaseData', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getReleaseData', () => {
    it('happy (complex) path with explicit bump type', async () => {
      await writeJson(
        {
          name: 'monorepo-root',
          version: '1.5.9',
          private: true,
          workspaces: ['packages/*'],
        },
        `${testDirectory}/package.json`,
      );

      await writeJson(
        { name: 'package-a', version: '1.5.9' },
        `${testDirectory}/packages/a/package.json`,
      );
      await writeJson(
        { name: 'package-b', version: '1.5.9' },
        `${testDirectory}/packages/b/package.json`,
      );
      await writeJson(
        { name: 'package-private', version: '1.5.9', private: true },
        `${testDirectory}/packages/private/package.json`,
      );

      const cliArgs = { _: ['major'], changelog: false };

      vi.spyOn(__, 'isFirstPublish')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const actual = await getReleaseData(cliArgs);

      expect(actual).toEqual({
        bumpType: 'major',
        allPackages: [
          {
            filepath: `${testDirectory}/packages/a/package.json`,
            content: { name: 'package-a', version: '1.5.9' },
            isFirstPublish: true,
            hasTrustedPublisher: false,
          },
          {
            filepath: `${testDirectory}/packages/b/package.json`,
            content: { name: 'package-b', version: '1.5.9' },
            isFirstPublish: false,
            hasTrustedPublisher: false,
          },
        ],
        currentVersion: '1.5.9',
        newVersion: '2.0.0',
        changelog: false,
      });
    });

    it.each([
      {
        title: 'aberlaas.trustedPublisher is true',
        packageContent: {
          name: 'package-a',
          version: '1.0.0',
          aberlaas: { trustedPublisher: true },
        },
        expected: true,
      },
      {
        title: 'no aberlaas key',
        packageContent: { name: 'package-a', version: '1.0.0' },
        expected: false,
      },
      {
        title: 'aberlaas exists but trustedPublisher is not true',
        packageContent: {
          name: 'package-a',
          version: '1.0.0',
          aberlaas: { trustedPublisher: false },
        },
        expected: false,
      },
    ])(
      'should set hasTrustedPublisher to $expected when $title',
      async ({ packageContent, expected }) => {
        await writeJson(
          {
            name: 'monorepo-root',
            version: '1.0.0',
            private: true,
            workspaces: ['packages/*'],
          },
          `${testDirectory}/package.json`,
        );
        await writeJson(
          packageContent,
          `${testDirectory}/packages/a/package.json`,
        );

        vi.spyOn(__, 'isFirstPublish').mockReturnValue(false);

        const actual = await getReleaseData({ _: ['patch'] });

        expect(actual).toHaveProperty(
          'allPackages.0.hasTrustedPublisher',
          expected,
        );
      },
    );
  });

  describe.slow('getBumpType', () => {
    it('should use the argument passed to the CLI', async () => {
      const actual = await __.getBumpType({ _: ['major'] }, 'whatever');

      expect(actual).toEqual('major');
    });
    it('should guess the type based on the commits', async () => {
      const currentVersion = '1.0.0';
      let actual;
      const repoFile = `${testDirectory}/README.md`;

      // Create a repo
      const repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
      await repo.createTag(`v${currentVersion}`);

      // Badly formatted commit
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('patch');

      // Doing stuff
      await write('chore', repoFile);
      await repo.commitAll('chore(readme): Doing stuff');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('patch');

      // Adding some docs
      await write('docs', repoFile);
      await repo.commitAll('docs(readme): Adding some docs');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('patch');

      // Improving perf
      await write('perf', repoFile);
      await repo.commitAll('perf(readme): Making it faster');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('patch');

      // Fixing something
      await write('fix', repoFile);
      await repo.commitAll('fix(readme): Fixing something');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('patch');

      // Adding a feature
      await write('feature', repoFile);
      await repo.commitAll('feat(readme): Add new feature');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('minor');

      // Doing a breaking change
      await write('breaking change', repoFile);
      await repo.commitAll('fix(readme)!: This is major');
      actual = await __.getBumpType({ _: [] }, currentVersion);
      expect(actual).toEqual('major');
    });
  });
});
