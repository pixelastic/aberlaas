const current = require('../renovate.js');
const githubHelper = require('../helpers/github.js');
describe('setup > renovate', () => {
  beforeEach(async () => {
    jest
      .spyOn(githubHelper, 'repoData')
      .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
    jest.spyOn(githubHelper, 'octokit').mockReturnValue();
  });
  describe('getRepositoryId', () => {
    it('should return the current repo id', async () => {
      githubHelper.octokit.mockReturnValue({ repository_id: 42 });
      const actual = await current.getRepositoryId();
      expect(actual).toEqual(42);
      expect(githubHelper.octokit).toHaveBeenCalledWith('repos.get', {
        owner: 'pixelastic',
        repo: 'aberlaas',
      });
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
      jest.spyOn(current, 'getRepositoryId').mockReturnValue();
    });
    it('should stop if no token available', async () => {
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(false);
      const actual = await current.enable();
      expect(actual).toEqual(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should stop if no adding the repo fails', async () => {
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(githubHelper, 'octokit').mockImplementation(() => {
        throw new Error();
      });

      const actual = await current.enable();
      expect(actual).toEqual(false);
      expect(current.__consoleError).toHaveBeenCalled();
    });
    it('should add the repo id to the app installation', async () => {
      jest.spyOn(githubHelper, 'hasToken').mockReturnValue(true);
      jest.spyOn(current, 'getRepositoryId').mockReturnValue(42);

      const actual = await current.enable();
      expect(actual).toEqual(true);
      expect(current.__consoleSuccess).toHaveBeenCalled();
      expect(githubHelper.octokit).toHaveBeenCalledWith(
        'apps.addRepoToInstallation',
        {
          installation_id: current.renovateId,
          repository_id: 42,
        }
      );
    });
  });
});
