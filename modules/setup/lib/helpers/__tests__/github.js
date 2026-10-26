import { __, ensureGithubToken, getRepoData, octokit } from '../github.js';

describe('setup/helpers/github', () => {
  beforeEach(async () => {
    __.clearCache();
  });
  describe('ensureGithubToken', () => {
    beforeEach(() => {
      vi.spyOn(__, 'token').mockReturnValue('TOKEN');
      vi.spyOn(__, 'octokit').mockReturnValue({ login: 'user' });
    });
    it.each([
      { title: 'missing', input: undefined },
      { title: 'empty', input: '' },
    ])('throws NO_GITHUB_TOKEN when the token is $title', async ({ input }) => {
      vi.spyOn(__, 'token').mockReturnValue(input);

      let actual = null;
      try {
        await ensureGithubToken();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_SETUP_NO_GITHUB_TOKEN');
      expect(actual).toHaveProperty(
        'message',
        "ABERLAAS_GITHUB_TOKEN is not set. Create a Classic token with 'repo' scope at https://github.com/settings/tokens",
      );
      expect(__.octokit).not.toHaveBeenCalled();
    });
    it('throws GITHUB_TOKEN_INVALID on a 401', async () => {
      vi.spyOn(__, 'octokit').mockImplementation(() => {
        throw Object.assign(new Error('Bad credentials'), { status: 401 });
      });

      let actual = null;
      try {
        await ensureGithubToken();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_SETUP_GITHUB_TOKEN_INVALID',
      );
      expect(actual).toHaveProperty(
        'message',
        "ABERLAAS_GITHUB_TOKEN is invalid. Create a Classic token with 'repo' scope at https://github.com/settings/tokens",
      );
    });
    it('rethrows non-401 errors unchanged', async () => {
      const networkError = Object.assign(new Error('Network down'), {
        status: 500,
      });
      vi.spyOn(__, 'octokit').mockImplementation(() => {
        throw networkError;
      });

      let actual = null;
      try {
        await ensureGithubToken();
      } catch (error) {
        actual = error;
      }

      expect(actual).toBe(networkError);
    });
    it('resolves when the token is valid', async () => {
      await ensureGithubToken();

      expect(__.octokit).toHaveBeenCalledWith('users.getAuthenticated');
    });
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

      expect(__).toHaveProperty('cache.octokit', mockOctokit);
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
      expect(callArgs).toHaveProperty('log.debug', __.noOp);
      expect(callArgs).toHaveProperty('log.info', __.noOp);
      expect(callArgs).toHaveProperty('log.warn', __.noOp);
      expect(callArgs).toHaveProperty('log.error', __.noOp);
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
