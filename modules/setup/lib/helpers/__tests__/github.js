import { __, getRepoData, octokit } from '../github.js';

describe('setup/helpers/github', () => {
  beforeEach(async () => {
    __.clearCache();
  });
  describe('getRepoData', () => {
    const manifest = {
      'user.email': 'something@email.com',
      'remote.origin.url': 'git@github.com:user/project.git',
    };
    it('should return .username and .repo', async () => {
      vi.spyOn(__, 'config').mockImplementation((key) => {
        return manifest[key];
      });
      const actual = await getRepoData();
      expect(actual).toEqual({
        username: 'user',
        repo: 'project',
        email: 'something@email.com',
      });
    });
    it('should use caching', async () => {
      vi.spyOn(__, 'config').mockImplementation((key) => {
        return manifest[key];
      });
      await getRepoData();

      vi.spyOn(__, 'config').mockImplementation(() => {
        return 'Always return this';
      });

      const actual = await getRepoData();
      expect(actual).toEqual({
        username: 'user',
        repo: 'project',
        email: 'something@email.com',
      });
    });
  });
  describe('octokit', () => {
    it('should save the Octokit instance in cache', async () => {
      const mockOctokit = {
        methodName() {
          return {};
        },
      };
      vi.spyOn(__, 'newOctokit').mockReturnValue(mockOctokit);
      vi.spyOn(__, 'token').mockReturnValue('TOKEN');

      await octokit('methodName', {});
      await octokit('methodName', {});

      expect(__.cache.octokit).toEqual(mockOctokit);
      expect(__.newOctokit).toHaveBeenCalledTimes(1);
    });
    it('should pass the correct auth token', async () => {
      const mockOctokit = {
        methodName: vi.fn().mockReturnValue({}),
      };
      vi.spyOn(__, 'token').mockReturnValue('TOKEN');
      __.newOctokit = vi.fn().mockReturnValue(mockOctokit);

      await octokit('methodName', {});

      expect(__.newOctokit).toHaveBeenCalledWith(
        expect.objectContaining({ auth: 'TOKEN' }),
      );
    });
    it('should disable octokit logging', async () => {
      const mockOctokit = {
        methodName: vi.fn().mockReturnValue({}),
      };
      vi.spyOn(__, 'token').mockReturnValue('TOKEN');
      __.Octokit = vi.fn().mockReturnValue(mockOctokit);

      await octokit('methodName', {});

      const callArgs = __.newOctokit.mock.calls[0][0];
      expect(callArgs.log.debug).toBe(__.noOp);
      expect(callArgs.log.info).toBe(__.noOp);
      expect(callArgs.log.warn).toBe(__.noOp);
      expect(callArgs.log.error).toBe(__.noOp);
    });
    it('should call the Octokit method with passed options', async () => {
      const mockOctokit = {
        methodName: vi.fn().mockReturnValue({}),
      };
      vi.spyOn(__, 'newOctokit').mockReturnValue(mockOctokit);

      await octokit('methodName', { mode: 'test' });

      expect(mockOctokit.methodName).toHaveBeenCalledWith({ mode: 'test' });
    });
    it('should return the response data', async () => {
      const mockOctokit = {
        methodName() {
          return { data: 'result' };
        },
      };
      vi.spyOn(__, 'newOctokit').mockReturnValue(mockOctokit);

      const actual = await octokit('methodName');
      expect(actual).toBe('result');
    });
  });
  describe('config', () => {
    it('should return the config value', async () => {
      __.cache.repository = {
        getConfig: vi.fn().mockReturnValue('name@provider.com'),
      };

      const actual = await __.config('user.email');

      expect(actual).toBe('name@provider.com');
    });
  });
});
