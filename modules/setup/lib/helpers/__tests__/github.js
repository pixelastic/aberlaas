import current from '../github.js';

describe('setup > helpers > github', () => {
  beforeEach(async () => {
    current.__cache = {};
  });
  describe('repoData', () => {
    it('should return .username and .repo', async () => {
      vi.spyOn(current, '__run').mockReturnValue({
        stdout: 'git@github.com:pixelastic/aberlaas.git',
      });
      const actual = await current.repoData();
      expect(actual).toHaveProperty('username', 'pixelastic');
      expect(actual).toHaveProperty('repo', 'aberlaas');
    });
  });
  describe('config', () => {
    it('should return the config value', async () => {
      vi.spyOn(current, '__run').mockReturnValue({
        stdout: 'name@provider.com',
      });
      const actual = await current.config('user.email');
      expect(current.__run).toHaveBeenCalledWith(
        'git config user.email',
        expect.anything(),
      );
      expect(actual).toBe('name@provider.com');
    });
  });
  describe('octokit', () => {
    it('should save the Octokit instance in cache', async () => {
      const mockOctokit = {
        methodName() {
          return {};
        },
      };
      vi.spyOn(current, '__Octokit').mockReturnValue(mockOctokit);
      vi.spyOn(current, 'token').mockReturnValue('TOKEN');

      await current.octokit('methodName', {});
      await current.octokit('methodName', {});

      expect(current.__cache.octokit).toEqual(mockOctokit);
      expect(current.__Octokit).toHaveBeenCalledTimes(1);
      expect(current.__Octokit).toHaveBeenCalledWith({ auth: 'TOKEN' });
    });
    it('should call the Octokit method with passed options', async () => {
      const mockOctokit = {
        methodName: vi.fn().mockReturnValue({}),
      };
      vi.spyOn(current, '__Octokit').mockReturnValue(mockOctokit);

      await current.octokit('methodName', { mode: 'test' });

      expect(mockOctokit.methodName).toHaveBeenCalledWith({ mode: 'test' });
    });
    it('should return the response data', async () => {
      const mockOctokit = {
        methodName() {
          return { data: 'result' };
        },
      };
      vi.spyOn(current, '__Octokit').mockReturnValue(mockOctokit);

      const actual = await current.octokit('methodName');
      expect(actual).toBe('result');
    });
  });
});
