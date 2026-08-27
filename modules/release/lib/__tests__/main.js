import { firostError, remove, tmpDirectory } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { __, run } from '../main.js';

describe('release/main', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('run', () => {
    const releaseData = { newVersion: '2.0.0' };
    beforeEach(() => {
      vi.spyOn(__, 'ensureRepositoryReady').mockReturnValue();
      vi.spyOn(__, 'getReleaseData').mockReturnValue(releaseData);
      vi.spyOn(__, 'ensureReleaseReady').mockReturnValue();
      vi.spyOn(__, 'updateGitRepo').mockReturnValue();
      vi.spyOn(__, 'publishToNpm').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
    });

    it('should orchestrate the full release flow', async () => {
      await run();

      expect(__.ensureRepositoryReady).toHaveBeenCalled();
      expect(__.getReleaseData).toHaveBeenCalled();
      expect(__.ensureReleaseReady).toHaveBeenCalledWith({}, releaseData);
      expect(__.consoleInfo).toHaveBeenCalledWith('Release new version 2.0.0');
      expect(__.updateGitRepo).toHaveBeenCalledWith(releaseData);
      expect(__.publishToNpm).toHaveBeenCalledWith(releaseData);
    });

    it('should stop execution when repository is not ready', async () => {
      vi.spyOn(__, 'ensureRepositoryReady').mockImplementation(() => {
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
      expect(__.ensureReleaseReady).not.toHaveBeenCalled();
      expect(__.updateGitRepo).not.toHaveBeenCalled();
      expect(__.publishToNpm).not.toHaveBeenCalled();
    });

    it('should stop execution when release is not ready', async () => {
      vi.spyOn(__, 'ensureReleaseReady').mockImplementation(() => {
        throw firostError('BAD_RELEASE', 'Release not ready');
      });

      let actual = null;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'BAD_RELEASE');
      expect(__.updateGitRepo).not.toHaveBeenCalled();
      expect(__.publishToNpm).not.toHaveBeenCalled();
    });

    it.each([
      { title: 'prompt Ctrl-C', code: 'FIROST_PROMPT_CTRL_C' },
      { title: 'select Ctrl-C', code: 'FIROST_SELECT_CTRL_C' },
    ])('should throw "Release cancelled" on $title', async ({ code }) => {
      vi.spyOn(__, 'ensureReleaseReady').mockImplementation(() => {
        throw firostError(code, 'User pressed Ctrl-C');
      });

      let actual = null;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('message', 'Release cancelled');
    });
  });
});
