const module = require('../publicKey.js');
const sshHelper = require('../../helpers/ssh.js');
const githubHelper = require('../../helpers/github.js');
describe('setup > autoRelease > publicKey', () => {
  describe('isEnabled', () => {
    beforeEach(async () => {
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
      jest.spyOn(githubHelper, 'octokit').mockReturnValue({});
      jest.spyOn(sshHelper, 'getKeys').mockReturnValue({});
    });
    it('should return false if no matching key', async () => {
      githubHelper.octokit.mockReturnValue([{ key: 'nope' }]);
      sshHelper.getKeys.mockReturnValue({ public: 'my key' });
      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
    it('should return true if a matching key', async () => {
      githubHelper.octokit.mockReturnValue([{ key: 'ssh-rsa AAAAB3==' }]);
      sshHelper.getKeys.mockReturnValue({
        public: 'ssh-rsa AAAAB3== user@provider.com',
      });

      const actual = await module.isEnabled();
      expect(actual).toEqual(true);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__consoleSuccess').mockReturnValue();
      jest.spyOn(module, '__consoleInfo').mockReturnValue();
    });
    it('should stop if already enabled', async () => {
      jest.spyOn(module, 'isEnabled').mockReturnValue(true);
      const actual = await module.enable();
      expect(actual).toEqual(true);
    });
    it('should deploy a write key', async () => {
      jest
        .spyOn(sshHelper, 'getKeys')
        .mockReturnValue({ public: 'public_key' });
      jest
        .spyOn(githubHelper, 'repoData')
        .mockReturnValue({ username: 'pixelastic', repo: 'aberlaas' });
      jest.spyOn(githubHelper, 'octokit').mockReturnValue({});
      await module.enable();
      expect(githubHelper.octokit).toHaveBeenCalledWith(
        'repos.createDeployKey',
        expect.objectContaining({
          owner: 'pixelastic',
          repo: 'aberlaas',
          key: 'public_key',
          read_only: false,
        })
      );
    });
  });
});
