import { __, run } from '../main.js';

describe('setup/main', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'enableGithub').mockReturnValue();
      vi.spyOn(__, 'enableCircleci').mockReturnValue();
      vi.spyOn(__, 'enableRenovate').mockReturnValue();
    });
    it('should configure github, circleci and renovate by default', async () => {
      await run();
      expect(__.enableGithub).toHaveBeenCalled();
      expect(__.enableCircleci).toHaveBeenCalled();
      expect(__.enableRenovate).toHaveBeenCalled();
    });
    it('should allow disabling services', async () => {
      await run({ circleci: false, renovate: false });
      expect(__.enableCircleci).not.toHaveBeenCalled();
      expect(__.enableRenovate).not.toHaveBeenCalled();
    });
  });
});
