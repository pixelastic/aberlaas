import current from '../png.js';
import helper from '../../../helper.js';
import { write, newFile, exists, emptyDir } from 'firost';

describe('compress > png', () => {
  const tmpDirectory = './tmp/compress/png';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });

  describe('getInputFiles', () => {
    it('should return all .png files by default', async () => {
      const goodPath = helper.hostPath('cat.png');
      const badPath = helper.hostPath('png.txt');
      await write('good', goodPath);
      await write('bad', badPath);

      const actual = await current.getInputFiles();

      expect(actual).toContain(goodPath);
      expect(actual).not.toContain(badPath);
    });
    describe('should only keep png files if files specified', () => {
      it.each([
        ['src/cat.png', true],
        ['src/blog/dog.png', true],
        ['dist/cat.png', false],
        ['src-backup/cat.png', false],
        ['src/cat.txt', false],
      ])('%s : %s', async (filepath, shouldBeIncluded) => {
        const absolutePath = helper.hostPath(filepath);
        await write('something', absolutePath);

        const actual = await current.getInputFiles('src/**/*');

        if (shouldBeIncluded) {
          expect(actual).toContain(absolutePath);
        } else {
          expect(actual).not.toContain(absolutePath);
        }
      });
    });
  });

  describe('getBinaryPath', () => {
    it('should return path to binary if exists', async () => {
      vi.spyOn(current, '__which').mockReturnValue('/path/to/binary');

      const actual = await current.getBinaryPath();

      expect(actual).toBe('/path/to/binary');
    });
    it('should return false if does not exist', async () => {
      vi.spyOn(current, '__which').mockReturnValue(false);

      const actual = await current.getBinaryPath();

      expect(actual).toBe(false);
    });
  });

  describe('run', () => {
    describe('with no binary available', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue(false);
      });
      it('should stop early', async () => {
        const actual = await current.run();
        expect(actual).toBe(true);
      });
    });
    describe('with a binary available', () => {
      it('should run the binary on all files', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('rm');

        const filepath = helper.hostPath('cat.png');
        await newFile(filepath);

        const actualBefore = await exists(filepath);
        expect(actualBefore).toBe(true);

        await current.run([filepath]);

        const actualAfter = await exists(filepath);
        expect(actualAfter).toBe(false);
      });
      it('should return true on success', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('echo');

        const filepath = helper.hostPath('cat.png');
        await newFile(filepath);

        const actual = await current.run([filepath]);
        expect(actual).toBe(true);
      });
      it('should throw an error if the binary returns an error code', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('false');

        const filepath = helper.hostPath('cat.png');
        await newFile(filepath);

        let actual;
        try {
          await current.run([filepath]);
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty('code', 'PngCompressError');
      });
    });
  });
});
