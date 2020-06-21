const module = require('../github.js');

describe('setup > helpers > github', () => {
  beforeEach(async () => {
    module.__cache = {};
  });
  describe('repoData', () => {
    it('should return .username and .repo', async () => {
      jest
        .spyOn(module, '__run')
        .mockReturnValue({ stdout: 'git@github.com:pixelastic/aberlaas.git' });
      const actual = await module.repoData();
      expect(actual).toHaveProperty('username', 'pixelastic');
      expect(actual).toHaveProperty('repo', 'aberlaas');
    });
  });
  describe('config', () => {
    it('should return the config value', async () => {
      jest
        .spyOn(module, '__run')
        .mockReturnValue({ stdout: 'name@provider.com' });
      const actual = await module.config('user.email');
      expect(module.__run).toHaveBeenCalledWith(
        'git config user.email',
        expect.anything()
      );
      expect(actual).toEqual('name@provider.com');
    });
  });
  describe('octokit', () => {
    it('should save the Octokit instance in cache', async () => {
      const mockOctokit = {
        methodName() {
          return {};
        },
      };
      jest.spyOn(module, '__Octokit').mockReturnValue(mockOctokit);
      jest.spyOn(module, 'token').mockReturnValue('TOKEN');

      await module.octokit('methodName', {});
      await module.octokit('methodName', {});

      expect(module.__cache.octokit).toEqual(mockOctokit);
      expect(module.__Octokit).toHaveBeenCalledTimes(1);
      expect(module.__Octokit).toHaveBeenCalledWith({ auth: 'TOKEN' });
    });
    it('should call the Octokit method with passed options', async () => {
      const mockOctokit = {
        methodName: jest.fn().mockReturnValue({}),
      };
      jest.spyOn(module, '__Octokit').mockReturnValue(mockOctokit);

      await module.octokit('methodName', { mode: 'test' });

      expect(mockOctokit.methodName).toHaveBeenCalledWith({ mode: 'test' });
    });
    it('should return the response data', async () => {
      const mockOctokit = {
        methodName() {
          return { data: 'result' };
        },
      };
      jest.spyOn(module, '__Octokit').mockReturnValue(mockOctokit);

      const actual = await module.octokit('methodName');
      expect(actual).toEqual('result');
    });
  });
});
