import { __, enable } from '../circleci.js';

describe('setup/circleci', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleSuccess').mockReturnValue();
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(__, 'getRepoData').mockReturnValue({});
      vi.spyOn(__, 'followRepo').mockReturnValue();
    });
    it('when no token available', async () => {
      vi.spyOn(__, 'hasToken').mockReturnValue(false);
      const actual = await enable();
      expect(actual).toBe(false);
      expect(__.consoleError).toHaveBeenCalled();
      expect(__.consoleSuccess).not.toHaveBeenCalled();
    });
    it('when already enabled', async () => {
      vi.spyOn(__, 'hasToken').mockReturnValue(true);
      vi.spyOn(__, 'isEnabled').mockReturnValue(true);
      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleError).not.toHaveBeenCalled();
      expect(__.consoleSuccess).toHaveBeenCalled();
    });
    it('with a token', async () => {
      vi.spyOn(__, 'isEnabled').mockReturnValue(false);
      vi.spyOn(__, 'hasToken').mockReturnValue(true);
      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleError).not.toHaveBeenCalled();
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(__.followRepo).toHaveBeenCalled();
    });
  });
  describe('isEnabled', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'getRepoData').mockReturnValue({
        username: 'pixelastic',
        repo: 'aberlaas',
      });
      vi.spyOn(__, 'api').mockReturnValue();
    });
    it('should call the API', async () => {
      await __.isEnabled();
      expect(__.api).toHaveBeenCalledWith('projects');
    });
    it('should return true if found in the list', async () => {
      __.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'aberlaas' },
      ]);
      const actual = await __.isEnabled();
      expect(actual).toBe(true);
    });
    it('should return false if not found in the list', async () => {
      __.api.mockReturnValue([
        { username: 'pixelastic', reponame: 'another-project' },
      ]);
      const actual = await __.isEnabled();
      expect(actual).toBe(false);
    });
  });
  describe('followRepo', () => {
    it('should call the API', async () => {
      vi.spyOn(__, 'getRepoData').mockReturnValue({
        username: 'pixelastic',
        repo: 'aberlaas',
      });
      vi.spyOn(__, 'api').mockReturnValue();

      await __.followRepo();
      expect(__.api).toHaveBeenCalledWith(
        'project/github/pixelastic/aberlaas/follow',
        {
          method: 'post',
        },
      );
    });
  });
});
