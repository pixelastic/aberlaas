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
    const releaseData = { newVersion: '2.0.0' };
    beforeEach(() => {
      vi.spyOn(__, 'ensureValidSetup').mockReturnValue();
      vi.spyOn(__, 'getReleaseData').mockReturnValue(releaseData);
      vi.spyOn(__, 'ensureCorrectPublishedFiles').mockReturnValue();
      vi.spyOn(__, 'updateGitRepo').mockReturnValue();
      vi.spyOn(__, 'publishToNpm').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });

    it('should orchestrate the full release flow', async () => {
      await run();

      expect(__.ensureValidSetup).toHaveBeenCalled();
      expect(__.getReleaseData).toHaveBeenCalled();
      expect(__.consoleInfo).toHaveBeenCalledWith('Release new version 2.0.0');
      expect(__.ensureCorrectPublishedFiles).toHaveBeenCalledWith(releaseData);
      expect(__.updateGitRepo).toHaveBeenCalledWith(releaseData);
      expect(__.publishToNpm).toHaveBeenCalledWith(releaseData);
    });

    it('should stop execution when setup is invalid', async () => {
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
      expect(__.ensureCorrectPublishedFiles).not.toHaveBeenCalled();
      expect(__.updateGitRepo).not.toHaveBeenCalled();
      expect(__.publishToNpm).not.toHaveBeenCalled();
    });

    it('should stop execution when published files are incorrect', async () => {
      vi.spyOn(__, 'ensureCorrectPublishedFiles').mockImplementation(() => {
        throw firostError('BAD_PUBLISHED_FILES', 'Files are incorrect');
      });

      let actual = null;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'BAD_PUBLISHED_FILES');
      expect(__.updateGitRepo).not.toHaveBeenCalled();
      expect(__.publishToNpm).not.toHaveBeenCalled();
    });
  });
});
