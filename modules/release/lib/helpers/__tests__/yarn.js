import { remove, tmpDirectory, writeJson } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { __, ensureYarnNpmLogin, getAllPublicPackages } from '../yarn.js';

describe('release/helpers/yarn', () => {
  let testDirectory;
  beforeEach(async () => {
    testDirectory = tmpDirectory(`aberlaas/${describeName}`);
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('ensureYarnNpmLogin', () => {
    it('should skip login when yarn npm whoami succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledTimes(1);
      expect(__.run).toHaveBeenCalledWith('yarn npm whoami', {
        stderr: false,
        stdout: false,
      });
    });

    it('should call yarn npm login when whoami fails', async () => {
      vi.spyOn(__, 'run')
        .mockImplementationOnce(() => {
          throw new Error('not logged in');
        })
        .mockReturnValueOnce() // yarn npm login
        .mockReturnValueOnce(); // re-check whoami

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledWith('yarn npm login', {
        stdin: true,
      });
    });

    it('should retry recursively after login', async () => {
      vi.spyOn(__, 'run')
        .mockImplementationOnce(() => {
          throw new Error('not logged in');
        })
        .mockReturnValueOnce() // yarn npm login
        .mockReturnValueOnce(); // recursive whoami check succeeds

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledTimes(3);
      expect(__.run).toHaveBeenLastCalledWith('yarn npm whoami', {
        stderr: false,
        stdout: false,
      });
    });
  });

  describe('getAllPublicPackages', () => {
    describe('single package', () => {
      it('should return the package when not private', async () => {
        await writeJson(
          { name: 'my-package' },
          `${testDirectory}/package.json`,
        );

        const actual = await getAllPublicPackages();

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

        const actual = await getAllPublicPackages();

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

        const actual = await getAllPublicPackages();

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
});
