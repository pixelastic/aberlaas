const current = require('../index.js');

describe('setup', () => {
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'circleci').mockReturnValue();
      jest.spyOn(current, 'renovate').mockReturnValue();
      jest.spyOn(current, 'autoRelease').mockReturnValue();
    });
    it('should enable circleci and renovate by defaul', async () => {
      await current.run();
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
