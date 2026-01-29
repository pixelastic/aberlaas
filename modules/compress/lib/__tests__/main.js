import { __, run } from '../main.js';

describe('compress', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__.types.png, 'run').mockReturnValue();
      vi.spyOn(__.types.dummy, 'run').mockReturnValue();
    });
    it('should run compress on all files by default', async () => {
      await run();

      expect(__.types.png.run).toHaveBeenCalled();
      expect(__.types.dummy.run).toHaveBeenCalled();
    });
    it('should run compress on specific files with a flag', async () => {
      await run({ png: true });

      expect(__.types.png.run).toHaveBeenCalled();
      expect(__.types.dummy.run).not.toHaveBeenCalled();
    });
    it('should return true if all succeeds', async () => {
      const actual = await run();
      expect(actual).toBe(true);
    });
    it('should throw an error if any compression fails', async () => {
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(__.types.dummy, 'run').mockImplementation(() => {
        throw new Error();
      });

      let actual;
      try {
        await run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_COMPRESS');
    });
  });
});
