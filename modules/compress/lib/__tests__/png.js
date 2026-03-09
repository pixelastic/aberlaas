import { _ } from 'golgoth';
import { exists, newFile, remove, tmpDirectory } from 'firost';
import { hostGitPath, hostPackagePath, mockHelperPaths } from 'aberlaas-helper';
import { __, run } from '../png.js';

describe('compress/png', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getInputFiles', () => {
    it('should return all .png files by default', async () => {
      const goodPath = hostPackagePath('cat.png');
      const badPath = hostPackagePath('png.txt');
      await newFile(goodPath);
      await newFile(badPath);

      const actual = await __.getInputFiles();

      expect(actual).toContain(goodPath);
      expect(actual).not.toContain(badPath);
    });
    it.each([
      // Default find
      { filepath: 'logo.png', expected: true, userPatterns: null },
      { filepath: 'src/header.png', expected: true, userPatterns: null },
      { filepath: 'src/team/tim.png', expected: true, userPatterns: null },
      // Default exclude
      { filepath: 'src/picture.gif', expected: false, userPatterns: null },
      { filepath: 'dist/logo.png', expected: false, userPatterns: null },
      // Focused folder
      {
        filepath: 'picture.png',
        expected: false,
        userPatterns: './src/**/*',
      },
      {
        filepath: 'lib/src/picture.png',
        expected: false,
        userPatterns: './src/**/*',
      },
    ])('$filepath', async ({ filepath, expected, userPatterns }) => {
      const absolutePath = hostGitPath(filepath);
      await newFile(absolutePath);

      const actual = await __.getInputFiles(userPatterns);
      const hasFile = _.includes(actual, absolutePath);
      expect(hasFile).toEqual(expected);
    });
  });

  describe('getBinaryPath', () => {
    it('should return path to binary if exists', async () => {
      vi.spyOn(__, 'which').mockReturnValue('/path/to/binary');

      const actual = await __.getBinaryPath();

      expect(actual).toBe('/path/to/binary');
    });
    it('should return false if does not exist', async () => {
      vi.spyOn(__, 'which').mockReturnValue(false);

      const actual = await __.getBinaryPath();

      expect(actual).toBe(false);
    });
  });

  describe('run', () => {
    describe('with no binary available', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'getBinaryPath').mockReturnValue(false);
      });
      it('should stop early', async () => {
        const actual = await run();
        expect(actual).toBe(true);
      });
    });
    describe('with a binary available', () => {
      it('should run the binary on all files', async () => {
        vi.spyOn(__, 'getBinaryPath').mockReturnValue('rm');

        const filepath = hostPackagePath('cat.png');
        await newFile(filepath);

        const actualBefore = await exists(filepath);
        expect(actualBefore).toBe(true);

        await run();

        const actualAfter = await exists(filepath);
        expect(actualAfter).toBe(false);
      });
      it('should return true on success', async () => {
        vi.spyOn(__, 'getBinaryPath').mockReturnValue('echo');

        const filepath = hostPackagePath('cat.png');
        await newFile(filepath);

        const actual = await run();
        expect(actual).toBe(true);
      });
      it('should return true if not file found', async () => {
        vi.spyOn(__, 'getBinaryPath').mockReturnValue('echo');

        const actual = await run();
        expect(actual).toBe(true);
      });
      it('should throw an error if the binary returns an error code', async () => {
        vi.spyOn(__, 'getBinaryPath').mockReturnValue('false');

        const filepath = hostPackagePath('cat.png');
        await newFile(filepath);

        let actual;
        try {
          await run();
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty('code', 'ABERLAAS_COMPRESS_PNG');
      });
    });
  });
});
