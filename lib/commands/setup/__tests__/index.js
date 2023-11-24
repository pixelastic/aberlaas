import current from '../index.js';

describe('setup', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'github').mockReturnValue();
      vi.spyOn(current, 'circleci').mockReturnValue();
      vi.spyOn(current, 'renovate').mockReturnValue();
      vi.spyOn(current, 'autoRelease').mockReturnValue();
    });
    it('should configure github, circleci and renovate by default', async () => {
      await current.run();
      expect(current.github).toHaveBeenCalled();
      expect(current.circleci).toHaveBeenCalled();
      expect(current.renovate).toHaveBeenCalled();
    });
    it('should not enable autoRelease by default', async () => {
      await current.run();
      expect(current.autoRelease).not.toHaveBeenCalled();
    });
    it('should allow disabling services', async () => {
      await current.run({ circleci: false, renovate: false });
      expect(current.circleci).not.toHaveBeenCalled();
      expect(current.renovate).not.toHaveBeenCalled();
    });
    it('should allow enabling services', async () => {
      await current.run({ 'auto-release': true });
      expect(current.autoRelease).toHaveBeenCalled();
    });
    it('should enable autoRelease after circleci', async () => {
      await current.run({ 'auto-release': true });
      expect(current.autoRelease).toHaveBeenCalledAfter(current.circleci);
    });
  });
});
