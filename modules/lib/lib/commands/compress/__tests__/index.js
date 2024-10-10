import { absolute, emptyDir } from 'firost';
import current from '../index.js';
import helper from '../../../helper.js';

describe('compress', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/compress/root');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current.types.png, 'run').mockReturnValue();
      vi.spyOn(current.types.dummy, 'run').mockReturnValue();
    });
    it('should run compress on all files by default', async () => {
      await current.run();

      expect(current.types.png.run).toHaveBeenCalled();
      expect(current.types.dummy.run).toHaveBeenCalled();
    });
    it('should run compress on specific files with a flag', async () => {
      await current.run({ png: true });

      expect(current.types.png.run).toHaveBeenCalled();
      expect(current.types.dummy.run).not.toHaveBeenCalled();
    });
    it('should return true if all succeeds', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
    it('should throw an error if any compression fails', async () => {
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(current.types.dummy, 'run').mockImplementation(() => {
        throw new Error();
      });

      let actual;
      try {
        await current.run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_COMPRESS');
    });
  });
});
