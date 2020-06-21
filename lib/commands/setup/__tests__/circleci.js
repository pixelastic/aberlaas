const module = require('../circleci.js');
const githubHelper = require('../helpers/github.js');
const circleciHelper = require('../helpers/circleci.js');
describe('setup > circleci', () => {
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__consoleInfo').mockReturnValue();
      jest.spyOn(module, '__consoleSuccess').mockReturnValue();
      jest.spyOn(module, '__consoleError').mockReturnValue();
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
      jest.spyOn(module, 'followRepo').mockReturnValue();
    });
    it('when already enabled', async () => {
      jest.spyOn(module, 'isEnabled').mockReturnValue(true);
      const actual = await module.enable();
      expect(actual).toEqual(true);
      expect(module.__consoleInfo).toHaveBeenCalled();
      expect(module.__consoleError).not.toHaveBeenCalled();
      expect(module.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('when no token available', async () => {
      jest.spyOn(module, 'isEnabled').mockReturnValue(false);
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(false);
      const actual = await module.enable();
      expect(actual).toEqual(false);
      expect(module.__consoleInfo).not.toHaveBeenCalled();
      expect(module.__consoleError).toHaveBeenCalled();
      expect(module.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      jest.spyOn(module, 'isEnabled').mockReturnValue(false);
      jest.spyOn(circleciHelper, 'hasToken').mockReturnValue(true);
      const actual = await module.enable();
      expect(actual).toEqual(true);
      expect(module.__consoleInfo).not.toHaveBeenCalled();
      expect(module.__consoleError).not.toHaveBeenCalled();
      expect(module.__consoleSuccess).toHaveBeenCalled();
      expect(module.followRepo).toHaveBeenCalled();
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
      await module.isEnabled();
      expect(circleciHelper.api).toHaveBeenCalledWith('projects');
    });
    it('should return true if found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'aberlaas' },
      ]);
      const actual = await module.isEnabled();
      expect(actual).toEqual(true);
    });
    it('should return false if not found in the list', async () => {
      circleciHelper.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
  });
  describe('followRepo', () => {
    it('should call the API', async () => {
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(circleciHelper, 'api').mockReturnValue();

      await module.followRepo();
      expect(circleciHelper.api).toHaveBeenCalledWith(
        'project/github/pixelastic/aberlaas/follow',
        {
          method: 'post',
        }
      );
    });
  });
});
