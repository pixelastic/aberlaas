import current from '../index.js';

describe('setup', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'github').mockReturnValue();
      vi.spyOn(current, 'circleci').mockReturnValue();
      vi.spyOn(current, 'renovate').mockReturnValue();
    });
    it('should configure github, circleci and renovate by default', async () => {
      await current.run();
      expect(current.github).toHaveBeenCalled();
      expect(current.circleci).toHaveBeenCalled();
      expect(current.renovate).toHaveBeenCalled();
    });
    it('should allow disabling services', async () => {
      await current.run({ circleci: false, renovate: false });
      expect(current.circleci).not.toHaveBeenCalled();
      expect(current.renovate).not.toHaveBeenCalled();
    });
  });
});
