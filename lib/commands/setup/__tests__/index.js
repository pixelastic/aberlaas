const module = require('../index.js');

describe('setup', () => {
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'circleci').mockReturnValue();
      jest.spyOn(module, 'renovate').mockReturnValue();
      jest.spyOn(module, 'autoRelease').mockReturnValue();
    });
    it('should enable circleci and renovate by defaul', async () => {
      await module.run();
      expect(module.circleci).toHaveBeenCalled();
      expect(module.renovate).toHaveBeenCalled();
    });
    it('should not enable autoRelease by default', async () => {
      await module.run();
      expect(module.autoRelease).not.toHaveBeenCalled();
    });
    it('should allow disabling services', async () => {
      await module.run({ circleci: false, renovate: false });
      expect(module.circleci).not.toHaveBeenCalled();
      expect(module.renovate).not.toHaveBeenCalled();
    });
    it('should allow enabling services', async () => {
      await module.run({ 'auto-release': true });
      expect(module.autoRelease).toHaveBeenCalled();
    });
    it('should enable autoRelease after circleci', async () => {
      await module.run({ 'auto-release': true });
      expect(module.autoRelease).toHaveBeenCalledAfter(module.circleci);
    });
  });
});
