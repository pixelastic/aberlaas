import { firostError } from 'firost';
import { __, ensureReleaseReady } from '../ensureReleaseReady.js';

describe('release/ensureReleaseReady', () => {
  describe('ensureTestsArePassing', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'yarnRun').mockReturnValue();
    });

    it('should return false when test is false', async () => {
      const actual = await __.ensureTestsArePassing({ test: false });

      expect(actual).toEqual(false);
      expect(__.yarnRun).not.toHaveBeenCalled();
    });

    it('should pass when tests succeed', async () => {
      const actual = await __.ensureTestsArePassing({ test: true });

      expect(actual).toEqual(true);
      expect(__.consoleInfo).toHaveBeenCalled();
      expect(__.yarnRun).toHaveBeenCalledWith('test --fail-fast');
    });

    it('should throw error when tests fail', async () => {
      vi.spyOn(__, 'yarnRun').mockImplementation(() => {
        throw firostError('ABERLAAS_TEST_FAIL', 'Tests are failing');
      });

      let actual = null;
      try {
        await __.ensureTestsArePassing({ test: true });
      } catch (err) {
        actual = err;
      }

      expect(__.consoleInfo).toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_TESTS_FAILING');
    });
  });

  describe('ensureLintIsPassing', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'yarnRun').mockReturnValue();
    });

    it('should return false when lint is false', async () => {
      const actual = await __.ensureLintIsPassing({ lint: false });

      expect(actual).toEqual(false);
      expect(__.yarnRun).not.toHaveBeenCalled();
    });

    it('should pass when lint succeeds', async () => {
      const actual = await __.ensureLintIsPassing({ lint: true });

      expect(actual).toEqual(true);
      expect(__.consoleInfo).toHaveBeenCalled();
      expect(__.yarnRun).toHaveBeenCalledWith('lint');
    });

    it('should throw error when lint fails', async () => {
      vi.spyOn(__, 'yarnRun').mockImplementation(() => {
        throw firostError('ABERLAAS_LINT_FAIL', 'Lint is failing');
      });

      let actual = null;
      try {
        await __.ensureLintIsPassing({ lint: true });
      } catch (err) {
        actual = err;
      }

      expect(__.consoleInfo).toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_LINT_FAILING');
    });
  });

  describe('ensureReleaseReady', () => {
    beforeEach(() => {
      vi.spyOn(__, 'ensureTestsArePassing').mockReturnValue(true);
      vi.spyOn(__, 'ensureLintIsPassing').mockReturnValue(true);
      vi.spyOn(__, 'ensureCorrectPublishedFiles').mockReturnValue();
    });

    it('should call all validation methods', async () => {
      const cliArgs = { _: ['patch'] };
      const releaseData = { newVersion: '2.0.0' };

      await ensureReleaseReady(cliArgs, releaseData);

      expect(__.ensureTestsArePassing).toHaveBeenCalled();
      expect(__.ensureLintIsPassing).toHaveBeenCalled();
      expect(__.ensureCorrectPublishedFiles).toHaveBeenCalledWith(releaseData);
    });

    it('should stop execution when a validation fails', async () => {
      const cliArgs = { _: ['patch'] };
      const releaseData = { newVersion: '2.0.0' };
      vi.spyOn(__, 'ensureTestsArePassing').mockImplementation(() => {
        throw firostError('BAD_TESTS', 'Tests failing');
      });

      let actual = null;
      try {
        await ensureReleaseReady(cliArgs, releaseData);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'BAD_TESTS');
      expect(__.ensureTestsArePassing).toHaveBeenCalled();
      expect(__.ensureLintIsPassing).not.toHaveBeenCalled();
    });
  });
});
