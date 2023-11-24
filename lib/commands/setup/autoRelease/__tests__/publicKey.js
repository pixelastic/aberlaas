import current from '../publicKey.js';
import sshHelper from '../../helpers/ssh.js';
import githubHelper from '../../helpers/github.js';

describe('setup > autoRelease > publicKey', () => {
  describe('isEnabled', () => {
    beforeEach(async () => {
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({});
      vi.spyOn(githubHelper, 'octokit').mockReturnValue({});
      vi.spyOn(sshHelper, 'getKeys').mockReturnValue({});
    });
    it('should return false if no matching key', async () => {
      githubHelper.octokit.mockReturnValue([{ key: 'nope' }]);
      sshHelper.getKeys.mockReturnValue({ public: 'my key' });
      const actual = await current.isEnabled();
      expect(actual).toBe(false);
    });
    it('should return true if a matching key', async () => {
      githubHelper.octokit.mockReturnValue([{ key: 'ssh-rsa AAAAB3==' }]);
      sshHelper.getKeys.mockReturnValue({
        public: 'ssh-rsa AAAAB3== user@provider.com',
      });

      const actual = await current.isEnabled();
      expect(actual).toBe(true);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
    });
    it('should stop if already enabled', async () => {
      vi.spyOn(current, 'isEnabled').mockReturnValue(true);
      const actual = await current.enable();
      expect(actual).toBe(true);
    });
    it('should deploy a write key', async () => {
      vi.spyOn(sshHelper, 'getKeys').mockReturnValue({ public: 'public_key' });
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({
        username: 'pixelastic',
        repo: 'aberlaas',
      });
      vi.spyOn(githubHelper, 'octokit').mockReturnValue({});
      await current.enable();
      expect(githubHelper.octokit).toHaveBeenCalledWith(
        'repos.createDeployKey',
        expect.objectContaining({
          owner: 'pixelastic',
          repo: 'aberlaas',
          key: 'public_key',
          read_only: false,
        }),
      );
    });
  });
});
