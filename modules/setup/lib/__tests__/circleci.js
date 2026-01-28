import { __, enable } from '../circleci.js';
import circleciHelper from '../helpers/circleci.js';
import githubHelper from '../helpers/github.js';

describe('setup > circleci', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleSuccess').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({});
      vi.spyOn(__, 'followRepo').mockReturnValue();
    });
    it('when no token available', async () => {
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(false);
      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
      expect(__.consoleSuccess).not.toHaveBeenCalled();
    });
    it('when already enabled', async () => {
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(__, 'isEnabled').mockReturnValue(true);
      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleError).not.toHaveBeenCalled();
      expect(__.consoleSuccess).toHaveBeenCalled();
    });
    it('with a token', async () => {
      vi.spyOn(__, 'isEnabled').mockReturnValue(false);
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleError).not.toHaveBeenCalled();
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(__.followRepo).toHaveBeenCalled();
    });
  });
  describe('isEnabled', () => {
    beforeEach(async () => {
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({
        username: 'pixelastic',
        repo: 'aberlaas',
      });
      vi.spyOn(circleciHelper, 'api').mockReturnValue();
    });
    it('should call the API', async () => {
      await __.isEnabled();
      expect(circleciHelper.api).toHaveBeenCalledWith('projects');
    });
    it('should return true if found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'aberlaas' },
      ]);
      const actual = await __.isEnabled();
      expect(actual).toBe(true);
    });
    it('should return false if not found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await __.isEnabled();
      expect(actual).toBe(false);
    });
  });
  describe('followRepo', () => {
    it('should call the API', async () => {
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({
        username: 'pixelastic',
        repo: 'aberlaas',
      });
      vi.spyOn(circleciHelper, 'api').mockReturnValue();

      await __.followRepo();
      expect(circleciHelper.api).toHaveBeenCalledWith(
        'project/github/pixelastic/aberlaas/follow',
        {
          method: 'post',
        },
      );
    });
  });
});
