import { firostError, remove, tmpDirectory } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { __, run } from '../main.js';

describe('main', () => {
  const testDirectory = tmpDirectory('aberlaas/release/main');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('run', () => {
    beforeEach(() => {
      vi.spyOn(__, 'ensureValidSetup').mockReturnValue();
      vi.spyOn(__, 'getReleaseData').mockReturnValue({
        newVersion: '2.0.0',
      });
      vi.spyOn(__, 'updateGitRepo').mockReturnValue();
      vi.spyOn(__, 'publishAllPackagesToNpm').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });

    it('should orchestrate the full release flow', async () => {
      await run();

      expect(__.ensureValidSetup).toHaveBeenCalled();
      expect(__.getReleaseData).toHaveBeenCalled();
      expect(__.consoleInfo).toHaveBeenCalledWith('Release new version 2.0.0');
      expect(__.updateGitRepo).toHaveBeenCalled();
      expect(__.publishAllPackagesToNpm).toHaveBeenCalled();
    });

    it('should stop execution when validation fails', async () => {
      vi.spyOn(__, 'ensureValidSetup').mockImplementation(() => {
        throw firostError('VALIDATION_FAILED', 'Something went wrong');
      });

      let actual = null;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'VALIDATION_FAILED');
      expect(__.getReleaseData).not.toHaveBeenCalled();
      expect(__.updateGitRepo).not.toHaveBeenCalled();
      expect(__.publishAllPackagesToNpm).not.toHaveBeenCalled();
    });
  });

  describe('publishAllPackagesToNpm', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'firostRun').mockReturnValue();
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

      expect(__.firostRun).toHaveBeenCalledWith('npm publish --access public', {
        cwd: `${testDirectory}/packages/a`,
      });
      expect(__.firostRun).toHaveBeenCalledWith('npm publish --access public', {
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
