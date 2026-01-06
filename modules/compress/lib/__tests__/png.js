import { absolute, emptyDir, exists, newFile } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { _ } from 'golgoth';
import current from '../png.js';
// TODO: Update vim auto-save, so if there is a _ is not defined or a method
// from firost, it automatically adds it at the top

describe('compress > png', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/compress/png');
  beforeEach(async () => {
    await emptyDir(tmpDirectory);

    // We mock them all so a bug doesn't just wipe our real aberlaas repo
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${tmpDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${tmpDirectory}/lib/src`,
    );
  });

  describe('getInputFiles', () => {
    it('should return all .png files by default', async () => {
      const goodPath = helper.hostPackagePath('cat.png');
      const badPath = helper.hostPackagePath('png.txt');
      await newFile(goodPath);
      await newFile(badPath);

      const actual = await current.getInputFiles();

      expect(actual).toContain(goodPath);
      expect(actual).not.toContain(badPath);
    });
    describe('assets/**/*', () => {
      it.each([
        ['image.png', false],
        ['lib/image.png', false],
        ['lib/src/image.png', false],

        ['lib/assets/image.png', true],
        ['lib/assets/subdir/image.png', true],

        ['lib/assets/image.gif', false],
        ['lib/assets-backup/image.png', false],
        ['lib/assets/dist/image.png', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFiles('assets/**/*');
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
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

        const filepath = helper.hostPackagePath('cat.png');
        await newFile(filepath);

        const actualBefore = await exists(filepath);
        expect(actualBefore).toBe(true);

        await current.run();

        const actualAfter = await exists(filepath);
        expect(actualAfter).toBe(false);
      });
      it('should return true on success', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('echo');

        const filepath = helper.hostPackagePath('cat.png');
        await newFile(filepath);

        const actual = await current.run();
        expect(actual).toBe(true);
      });
      it('should return true if not file found', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('echo');

        const actual = await current.run();
        expect(actual).toBe(true);
      });
      it('should throw an error if the binary returns an error code', async () => {
        vi.spyOn(current, 'getBinaryPath').mockReturnValue('false');

        const filepath = helper.hostPackagePath('cat.png');
        await newFile(filepath);

        let actual;
        try {
          await current.run();
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty('code', 'PngCompressError');
      });
    });
  });
});
