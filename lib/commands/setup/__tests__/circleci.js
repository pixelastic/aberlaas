const module = require('../circleci.js');
const helper = require('../helper.js');
describe('setup > circleci', () => {
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__consoleInfo').mockReturnValue();
      jest.spyOn(module, '__consoleSuccess').mockReturnValue();
      jest.spyOn(module, '__consoleError').mockReturnValue();
      jest.spyOn(helper, 'githubData').mockReturnValue({});
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
      jest.spyOn(helper, 'hasCircleCiToken').mockReturnValue(false);
      const actual = await module.enable();
      expect(actual).toEqual(false);
      expect(module.__consoleInfo).not.toHaveBeenCalled();
      expect(module.__consoleError).toHaveBeenCalled();
      expect(module.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      jest.spyOn(module, 'isEnabled').mockReturnValue(false);
      jest.spyOn(helper, 'hasCircleCiToken').mockReturnValue(true);
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
        .spyOn(helper, 'githubData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(helper, 'circleCiV1').mockReturnValue();
    });
    it('should call the API', async () => {
      await module.isEnabled();
      expect(helper.circleCiV1).toHaveBeenCalledWith('projects');
    });
    it('should return true if found in the list', async () => {
      helper.circleCiV1.mockReturnValue([
        { username: 'pixelastic', reponame: 'aberlaas' },
      ]);
      const actual = await module.isEnabled();
      expect(actual).toEqual(true);
    });
    it('should return false if not found in the list', async () => {
      helper.circleCiV1.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
  });
  describe('followRepo', () => {
    it('should call the API', async () => {
      jest
        .spyOn(helper, 'githubData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(helper, 'circleCiV1').mockReturnValue();

      await module.followRepo();
      expect(helper.circleCiV1).toHaveBeenCalledWith(
        'project/github/pixelastic/aberlaas/follow',
        {
          method: 'post',
        }
      );
    });
  });
});
