import current from '../circleci.js';
import githubHelper from '../helpers/github.js';
import circleciHelper from '../helpers/circleci.js';

describe('setup > circleci', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({});
      vi.spyOn(current, 'followRepo').mockReturnValue();
    });
    it('when no token available', async () => {
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toBe(false);
      expect(current.__consoleInfo).not.toHaveBeenCalled();
      expect(current.__consoleError).toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('when already enabled', async () => {
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(current, 'isEnabled').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toBe(true);
      expect(current.__consoleInfo).toHaveBeenCalled();
      expect(current.__consoleError).not.toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      vi.spyOn(current, 'isEnabled').mockReturnValue(false);
      vi.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toBe(true);
      expect(current.__consoleInfo).not.toHaveBeenCalled();
      expect(current.__consoleError).not.toHaveBeenCalled();
      expect(current.__consoleSuccess).toHaveBeenCalled();
      expect(current.followRepo).toHaveBeenCalled();
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
      await current.isEnabled();
      expect(circleciHelper.api).toHaveBeenCalledWith('projects');
    });
    it('should return true if found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'aberlaas' },
      ]);
      const actual = await current.isEnabled();
      expect(actual).toBe(true);
    });
    it('should return false if not found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await current.isEnabled();
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

      await current.followRepo();
      expect(circleciHelper.api).toHaveBeenCalledWith(
        'project/github/pixelastic/aberlaas/follow',
        {
          method: 'post',
        },
      );
    });
  });
});
