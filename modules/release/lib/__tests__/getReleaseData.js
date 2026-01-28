import { remove, tmpDirectory, write, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __, getReleaseData } from '../getReleaseData.js';

describe('getReleaseData', () => {
  const testDirectory = tmpDirectory('aberlaas/release/getReleaseData');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
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

      const cliArgs = { _: ['major'], 'skip-changelog': true };

      const actual = await getReleaseData(cliArgs);

      expect(actual).toEqual({
        bumpType: 'major',
        allPackages: [
          {
            filepath: `${testDirectory}/packages/a/package.json`,
            content: { name: 'package-a', version: '1.5.9' },
          },
          {
            filepath: `${testDirectory}/packages/b/package.json`,
            content: { name: 'package-b', version: '1.5.9' },
          },
        ],
        currentVersion: '1.5.9',
        newVersion: '2.0.0',
        skipChangelog: true,
      });
    });
  });

  describe('getAllPackagesToRelease', () => {
    describe('single package', () => {
      it('should return the package when not private', async () => {
        await writeJson(
          { name: 'my-package' },
          `${testDirectory}/package.json`,
        );

        const actual = await __.getAllPackagesToRelease();

        expect(actual).toEqual([
          {
            filepath: `${testDirectory}/package.json`,
            content: { name: 'my-package' },
          },
        ]);
      });

      it('should return empty array when package is private', async () => {
        await writeJson(
          { name: 'my-package', private: true },
          `${testDirectory}/package.json`,
        );

        const actual = await __.getAllPackagesToRelease();

        expect(actual).toEqual([]);
      });
    });

    describe('monorepo with workspaces', () => {
      it('should return all non-private workspace packages', async () => {
        await writeJson(
          {
            name: 'monorepo-root',
            private: true,
            workspaces: ['packages/*'],
          },
          `${testDirectory}/package.json`,
        );

        await writeJson(
          { name: 'package-a' },
          `${testDirectory}/packages/a/package.json`,
        );
        await writeJson(
          { name: 'package-b', author: 'myself' },
          `${testDirectory}/packages/b/package.json`,
        );
        await writeJson(
          { name: 'package-private', private: true },
          `${testDirectory}/packages/package-private/package.json`,
        );

        const actual = await __.getAllPackagesToRelease();

        expect(actual).toEqual([
          {
            filepath: `${testDirectory}/packages/a/package.json`,
            content: { name: 'package-a' },
          },
          {
            filepath: `${testDirectory}/packages/b/package.json`,
            content: { name: 'package-b', author: 'myself' },
          },
        ]);
      });
    });
  });

  describe('getBumpType', () => {
    vi.setConfig({ testTimeout: 15_000 });

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
