import { __, enable } from '../renovate.js';
import githubHelper from '../helpers/github.js';

const RENOVATE_ID = 2471197;

describe('setup > renovate', () => {
  beforeEach(async () => {
    vi.spyOn(__, 'consoleSuccess').mockReturnValue();
    vi.spyOn(__, 'consoleInfo').mockReturnValue();
    vi.spyOn(__, 'consoleError').mockReturnValue();
    vi.spyOn(githubHelper, 'repoData').mockReturnValue({
      username: 'pixelastic',
      repo: 'aberlaas',
    });
    vi.spyOn(githubHelper, 'octokit').mockReturnValue();
  });
  describe('getRepositoryId', () => {
    it('should return the current repo id', async () => {
      githubHelper.octokit.mockReturnValue({ id: 42 });
      const actual = await __.getRepositoryId();
      expect(actual).toBe(42);
      expect(githubHelper.octokit).toHaveBeenCalledWith('repos.get', {
        owner: 'pixelastic',
        repo: 'aberlaas',
      });
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleSuccess').mockReturnValue();
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(__, 'getRepositoryId').mockReturnValue();
    });
    it('should stop if no token available', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(false);
      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
    });
    it('should stop if no adding the repo fails', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(githubHelper, 'octokit').mockImplementation(() => {
        throw new Error();
      });

      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
    });
    it('should add the repo id to the app installation', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      vi.spyOn(__, 'getRepositoryId').mockReturnValue(42);

      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(githubHelper.octokit).toHaveBeenCalledWith(
        'apps.addRepoToInstallation',
        {
          installation_id: RENOVATE_ID,
          repository_id: 42,
        },
      );
    });
  });
});
