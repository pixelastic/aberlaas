import current from '../github.js';
import githubHelper from '../helpers/github.js';

describe('setup > github', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({
        username: 'username',
        repo: 'repo',
      });
      vi.spyOn(githubHelper, 'octokit').mockReturnValue();
    });
    it('when no token available', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toBe(false);
      expect(current.__consoleError).toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      vi.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toBe(true);
      expect(current.__consoleError).not.toHaveBeenCalled();
      expect(current.__consoleSuccess).toHaveBeenCalled();
      expect(githubHelper.octokit).toHaveBeenCalledWith('repos.update', {
        owner: 'username',
        repo: 'repo',
        allow_merge_commit: false,
        allow_rebase_merge: true,
        allow_squash_merge: true,
        delete_branch_on_merge: true,
      });
    });
  });
});
