const current = require('../circleci.js');
const githubHelper = require('../helpers/github.js');
const circleciHelper = require('../helpers/circleci.js');
describe('setup > circleci', () => {
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
      jest.spyOn(current, 'followRepo').mockReturnValue();
    });
    it('when no token available', async () => {
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toEqual(false);
      expect(current.__consoleInfo).not.toHaveBeenCalled();
      expect(current.__consoleError).toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('when already enabled', async () => {
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(current, 'isEnabled').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toEqual(true);
      expect(current.__consoleInfo).toHaveBeenCalled();
      expect(current.__consoleError).not.toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      jest.spyOn(current, 'isEnabled').mockReturnValue(false);
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toEqual(true);
      expect(current.__consoleInfo).not.toHaveBeenCalled();
      expect(current.__consoleError).not.toHaveBeenCalled();
      expect(current.__consoleSuccess).toHaveBeenCalled();
      expect(current.followRepo).toHaveBeenCalled();
    });
  });
  describe('isEnabled', () => {
    beforeEach(async () => {
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(circleciHelper, 'api').mockReturnValue();
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
      expect(actual).toEqual(true);
    });
    it('should return false if not found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await current.isEnabled();
      expect(actual).toEqual(false);
    });
  });
  describe('followRepo', () => {
    it('should call the API', async () => {
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(circleciHelper, 'api').mockReturnValue();

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
