import current from '../helper.js';
import writeJson from 'firost/writeJson.js';
import emptyDir from 'firost/emptyDir.js';
import readJson from 'firost/readJson.js';
import write from 'firost/write.js';
import pMap from 'golgoth/pMap.js';
import _ from 'golgoth/lodash.js';
import path from 'path';

describe('current', () => {
  const tmpDirectory = './tmp/helper';
  describe('hostRoot', () => {
    it('should return the current working directory', () => {
      const cwd = process.cwd();
      const actual = current.hostRoot();

      expect(actual).toEqual(cwd);
    });
  });
  describe('hostPath', () => {
    it('should return path relative to working directory', () => {
      vi.spyOn(current, 'hostRoot').mockReturnValue('/basedir/');
      const actual = current.hostPath('foo/bar/baz.js');

      expect(actual).toBe('/basedir/foo/bar/baz.js');
    });
  });
  describe('aberlaasRoot', () => {
    it('should return the aberlaas root', async () => {
      const aberlaasRootPath = current.aberlaasRoot();
      const actual = await readJson(`${aberlaasRootPath}/package.json`);

      expect(actual).toHaveProperty('name', 'aberlaas');
    });
  });
  describe('aberlaasPath', () => {
    it('should return path relative to aberlaas directory', () => {
      vi.spyOn(current, 'aberlaasRoot').mockReturnValue('/aberlaas/');
      const actual = current.aberlaasPath('foo/bar/baz.js');

      expect(actual).toBe('/aberlaas/foo/bar/baz.js');
    });
  });
  describe('findHostFiles', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(current.hostRoot());
    });
    describe('Finding files', () => {
      it.each([
        ['lib/__tests__/module.js', 'lib/__tests__/module.js'],
        ['lib/__tests__/module.js', 'lib/**/*.js'],
        ['lib/__tests__/module.js', 'lib'],
        ['.eslintrc.js', '.'],
        ['lib/__tests__/.config.js', '.'],
        ['.config/release.js', '.'],
      ])('%s found with %s', async (filepath, pattern) => {
        await write('', current.hostPath(filepath));
        const actual = await current.findHostFiles(pattern);
        expect(actual).toContain(current.hostPath(filepath));
      });
    });
    describe('Blocklist', () => {
      it.each([
        ['build/main.js'],
        ['dist/index.html'],
        ['fixtures/test.html'],
        ['node_modules/firost/package.json'],
        ['tmp/list.txt'],
        ['vendors/jQuery.js'],
        ['.git/hooks/pre-commit.sh'],
        ['.yarn/releases/index.js'],
      ])('%s not found', async (filepath) => {
        await write('', current.hostPath(filepath));
        const actual = await current.findHostFiles('.');
        expect(actual).not.toContain(current.hostPath(filepath));
      });
    });
    describe('Safelist by extension', () => {
      it.each([
        [
          'Safelisting extension with dot',
          ['src/script.js', 'src/style.css', 'src/assets/cover.png'],
          '.css',
          ['src/style.css'],
          ['src/scripts.js', 'src/assets/cover.png'],
        ],
        [
          'Safelisting extension without dots',
          ['src/script.js', 'src/style.css', 'src/assets/cover.png'],
          'css',
          ['src/style.css'],
          ['src/scripts.js', 'src/assets/cover.png'],
        ],
        [
          'Safelisting several extensions',
          ['src/script.js', 'src/style.css', 'src/assets/cover.png'],
          ['js', '.css'],
          ['src/script.js', 'src/style.css'],
          ['src/assets/cover.png'],
        ],
        [
          'Ignore folders',
          ['src/script.js', 'src/style.css', 'src/assets/cover.png'],
          [],
          ['src/script.js', 'src/style.css', 'src/assets/cover.png'],
          ['src/assets'],
        ],
      ])('%s', async (_name, files, extensions, allow, block) => {
        await pMap(files, async (filepath) => {
          await write('', current.hostPath(filepath));
        });

        const actual = await current.findHostFiles('.', extensions);
        _.each(allow, (expected) => {
          expect(actual).toContain(current.hostPath(expected));
        });
        _.each(block, (expected) => {
          expect(actual).not.toContain(current.hostPath(expected));
        });
      });
    });
  });
  describe('configFile', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(current.hostRoot());
    });
    it.each([
      [
        'Take the specified file if available',
        ['my-eslintrc.js'],
        '.',
        ['my-eslintrc.js', null, null],
        'my-eslintrc.js',
      ],
      [
        'Allow for absolute CLI arguments',
        ['my-eslintrc.js'],
        '.',
        [current.aberlaasPath('package.json'), null, null],
        current.aberlaasPath('package.json'),
      ],
      [
        'Still return the userPath even if does not exist',
        ['.eslintrc.js'],
        '.',
        ['my-eslint.js', '.eslintrc.js', null],
        'my-eslint.js',
      ],
      [
        'Take the closest upPath if no user file set',
        ['my-eslintrc.js', '.eslintrc.js'],
        '.',
        [null, '.eslintrc.js', null],
        '.eslintrc.js',
      ],
      [
        'Take the closest upPath if no user file set in upper directories',
        ['lib/index.js', '.eslintrc.js'],
        './lib',
        [null, '.eslintrc.js', null],
        '.eslintrc.js',
      ],
      [
        'Fallback on file in aberlaas',
        [],
        '.',
        [null, null, 'lib/config/eslint.js'],
        current.aberlaasPath('lib/config/eslint.js'),
      ],
    ])('%s', async (_name, files, pathPrefix, args, expected) => {
      await pMap(files, async (filepath) => {
        await write('', current.hostPath(filepath));
      });

      // Change the hostPath so we actually run the method from a lower
      // directory
      const fullExpected = current.hostPath(expected);
      vi.spyOn(current, 'hostRoot').mockReturnValue(
        path.resolve(tmpDirectory, pathPrefix),
      );

      const actual = await current.configFile(...args);
      expect(actual).toEqual(fullExpected);
    });
  });
  describe('which', () => {
    it('should return path to the one saved in the host', async () => {
      vi.spyOn(current, '__run').mockReturnValue({ stdout: '/bar' });

      const actual = await current.which('foo');

      expect(current.__run).toHaveBeenCalledWith('yarn bin foo', {
        stdout: false,
        stderr: false,
      });
      expect(actual).toBe('/bar');
    });
    it('should return aberlaas path if none in host', async () => {
      vi.spyOn(current, '__run')
        .mockReturnValueOnce({ stdout: null })
        .mockReturnValueOnce({ stdout: '/aberlaas/bar' });
      vi.spyOn(current, 'aberlaasRoot').mockReturnValue('/aberlaas');

      const actual = await current.which('foo');

      expect(actual).toBe('/aberlaas/bar');
      expect(current.__run).toHaveBeenCalledWith(
        'yarn bin foo',
        expect.anything(),
      );
      expect(current.__run).toHaveBeenCalledWith(
        'cd /aberlaas && yarn bin foo',
        expect.anything(),
      );
    });
    it('should return null if never found', async () => {
      vi.spyOn(current, '__run').mockReturnValue({ stdout: null });

      const actual = await current.which('foo');

      expect(actual).toBeNull();
    });
    it('should strip ANSI characters', async () => {
      vi.spyOn(current, '__run').mockReturnValue({
        stdout: '\u001b[2K\u001b[1Gfoo',
      });

      const actual = await current.which('foo');

      expect(actual).toBe('foo');
    });
  });
  describe('yarnRun', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(current.hostRoot());
    });
    it('should display script stdout to stdout', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'echo "foo"' } },
        current.hostPath('package.json'),
      );

      const actual = await captureOutput(async () => {
        await current.yarnRun('lint');
      });

      expect(actual.stdout).toInclude('foo');
    });
    it('should throw an error if the script fails', async () => {
      await writeJson(
        { license: 'MIT', scripts: { lint: 'exit 42' } },
        current.hostPath('package.json'),
      );

      let actual;
      try {
        await captureOutput(async () => {
          await current.yarnRun('lint');
        });
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining(
          'Command failed with exit code 42: yarn run lint',
        ),
      );
      expect(actual).toHaveProperty('code', 42);
    });
  });
});
