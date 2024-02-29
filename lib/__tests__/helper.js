import current from '../helper.js';
import {
  remove,
  readJson,
  tmpDirectory as generateTmpDirectory,
  write,
} from 'firost';
import { pMap, _ } from 'golgoth';
import path from 'path';

describe('current', () => {
  describe('hostRoot', () => {
    it('should return the current working directory', () => {
      const cwd = process.cwd();
      const actual = current.hostRoot();

      expect(actual).toEqual(cwd);
    });
  });

  describe('with hostRoot mocked', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'hostRoot').mockReturnValue(
        generateTmpDirectory('aberlaas/helper'),
      );
    });
    afterEach(async () => {
      await remove(current.hostRoot());
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
          path.resolve(current.hostRoot(), pathPrefix),
        );

        const actual = await current.configFile(...args);
        expect(actual).toEqual(fullExpected);
      });
    });
  });
});
