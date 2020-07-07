const current = require('../github.js');
const githubHelper = require('../helpers/github.js');
describe('setup > github', () => {
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ username: 'username', repo: 'repo' });
      jest.spyOn(githubHelper, 'octokit').mockReturnValue();
    });
    it('when no token available', async () => {
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toEqual(false);
      expect(current.__consoleError).toHaveBeenCalled();
      expect(current.__consoleSuccess).not.toHaveBeenCalled();
    });
    it('with a token', async () => {
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toEqual(true);
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
