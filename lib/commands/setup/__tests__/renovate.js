import current from '../renovate.js';
import githubHelper from '../helpers/github.js';

describe('setup > renovate', () => {
  beforeEach(async () => {
    vi.spyOn(githubHelper, 'repoData').mockReturnValue({
      username: 'pixelastic',
      repo: 'aberlaas',
    });
    vi.spyOn(githubHelper, 'octokit').mockReturnValue();
  });
  describe('getRepositoryId', () => {
    it('should return the current repo id', async () => {
      githubHelper.octokit.mockReturnValue({ id: 42 });
      const actual = await current.getRepositoryId();
      expect(actual).toBe(42);
      expect(githubHelper.octokit).toHaveBeenCalledWith('repos.get', {
        owner: 'pixelastic',
        repo: 'aberlaas',
      });
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(current, 'getRepositoryId').mockReturnValue();
    });
    it('should stop if no token available', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toBe(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should stop if no adding the repo fails', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(githubHelper, 'octokit').mockImplementation(() => {
        throw new Error();
      });

      const actual = await current.enable();
      expect(actual).toBe(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should add the repo id to the app installation', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(current, 'getRepositoryId').mockReturnValue(42);

      const actual = await current.enable();
      expect(actual).toBe(true);
      expect(current.__consoleSuccess).toHaveBeenCalled();
      expect(githubHelper.octokit).toHaveBeenCalledWith(
        'apps.addRepoToInstallation',
        {
          installation_id: current.renovateId,
          repository_id: 42,
        },
      );
    });
  });
});
