import { __, enable } from '../renovate.js';

describe('setup/renovate', () => {
  beforeEach(async () => {
    vi.spyOn(__, 'consoleSuccess').mockReturnValue();
    vi.spyOn(__, 'consoleInfo').mockReturnValue();
    vi.spyOn(__, 'consoleError').mockReturnValue();
    vi.spyOn(__, 'getRepoData').mockReturnValue({
      username: 'pixelastic',
      repo: 'aberlaas',
    });
    vi.spyOn(__, 'octokit').mockReturnValue();
  });
  describe('getRepositoryId', () => {
    it('should return the current repo id', async () => {
      __.octokit.mockReturnValue({ id: 42 });
      const actual = await __.getRepositoryId();
      expect(actual).toBe(42);
      expect(__.octokit).toHaveBeenCalledWith('repos.get', {
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
      vi.spyOn(__, 'hasToken').mockReturnValue(false);
      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
    });
    it('should stop if no adding the repo fails', async () => {
      vi.spyOn(__, 'hasToken').mockReturnValue(true);
      vi.spyOn(__, 'octokit').mockImplementation(() => {
        throw new Error();
      });

      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
    });
    it('should add the repo id to the app installation', async () => {
      vi.spyOn(__, 'hasToken').mockReturnValue(true);
      vi.spyOn(__, 'getRepositoryId').mockReturnValue(42);

      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(__.octokit).toHaveBeenCalledWith('apps.addRepoToInstallation', {
        installation_id: __.renovateId,
        repository_id: 42,
      });
    });
  });
});
