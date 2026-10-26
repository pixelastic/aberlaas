import { __, enable } from '../github.js';

describe('setup/github', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleSuccess').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'getRepoData').mockReturnValue({
        username: 'username',
        repo: 'repo',
      });
      vi.spyOn(__, 'octokit').mockReturnValue();
    });
    it('configures the repository', async () => {
      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(__.octokit).toHaveBeenCalledWith('repos.update', {
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
