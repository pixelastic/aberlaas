import { emptyDir, tmpDirectory, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { __ } from '../main.js';

describe('main', () => {
  const testDirectory = tmpDirectory('aberlaas/release/main');
  beforeEach(async () => {
    await emptyDir(testDirectory);
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
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

  describe('getReleaseData', () => {
    it('happy (complex) path', async () => {
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

      const actual = await __.getReleaseData(cliArgs);

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

  describe('publishAllPackagesToNpm', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'run').mockReturnValue();
    });
    it('should publish all packages to npm', async () => {
      const releaseData = {
        allPackages: [
          {
            filepath: `${testDirectory}/packages/a/package.json`,
            content: { name: 'package-a' },
          },
          {
            filepath: `${testDirectory}/packages/b/package.json`,
            content: { name: 'package-b' },
          },
        ],
      };

      await __.publishAllPackagesToNpm(releaseData);

      expect(__.run).toHaveBeenCalledWith('npm publish --access public', {
        cwd: `${testDirectory}/packages/a`,
      });
      expect(__.run).toHaveBeenCalledWith('npm publish --access public', {
        cwd: `${testDirectory}/packages/b`,
      });

      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Publishing package-a to npm',
      );
      expect(__.consoleInfo).toHaveBeenCalledWith(
        'Publishing package-b to npm',
      );
    });
  });
});
