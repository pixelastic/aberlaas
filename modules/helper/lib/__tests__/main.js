import {
  tmpDirectory as generateTmpDirectory,
  remove,
  write,
  writeJson,
} from 'firost';
import { _, pMap } from 'golgoth';
import current from '../main.js';

describe('current', () => {
  describe('hostGitRoot', () => {
    it('should return the current working directory', () => {
      const cwd = process.cwd();
      const actual = current.hostGitRoot();

      expect(actual).toEqual(cwd);
    });
  });

  describe('with hostGitRoot mocked', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'hostGitRoot').mockReturnValue(
        generateTmpDirectory('aberlaas/helper'),
      );
    });
    afterEach(async () => {
      await remove(current.hostGitRoot());
    });

    describe('hostGitPath', () => {
      it('should return path relative to working directory', () => {
        vi.spyOn(current, 'hostGitRoot').mockReturnValue('/basedir/');
        const actual = current.hostGitPath('foo/bar/baz.js');

        expect(actual).toBe('/basedir/foo/bar/baz.js');
      });
    });
    describe('findHostFiles', () => {
      describe('Finding files', () => {
        it.each([
          ['lib/__tests__/module.js', 'lib/__tests__/module.js'],
          ['lib/__tests__/module.js', 'lib/**/*.js'],
          ['lib/__tests__/module.js', 'lib'],
          ['.nvmrc', '.'],
          ['lib/__tests__/.config.js', '.'],
          ['.config/release.js', '.'],
        ])('%s found with %s', async (filepath, pattern) => {
          await write('', current.hostGitPath(filepath));
          const actual = await current.findHostFiles(pattern);
          expect(actual).toContain(current.hostGitPath(filepath));
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
          await write('', current.hostGitPath(filepath));
          const actual = await current.findHostFiles('.');
          expect(actual).not.toContain(current.hostGitPath(filepath));
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
            await write('', current.hostGitPath(filepath));
          });

          const actual = await current.findHostFiles('.', extensions);
          _.each(allow, (expected) => {
            expect(actual).toContain(current.hostGitPath(expected));
          });
          _.each(block, (expected) => {
            expect(actual).not.toContain(current.hostGitPath(expected));
          });
        });
      });
    });
    describe('getConfig', () => {
      beforeEach(async () => {
        // The package.json with type: module is required so I can import with
        // the export default syntax
        await writeJson(
          { type: 'module' },
          current.hostGitPath('package.json'),
        );
        await write(
          "export default { name: 'custom' }",
          current.hostGitPath('./custom.js'),
        );
        await write(
          "export default { name: 'tool' }",
          current.hostGitPath('./tool.config.js'),
        );
      });
      describe('with a specific path given', () => {
        it('should give priority to the path given', async () => {
          const actual = await current.getConfig(
            './custom.js',
            './tool.config.js',
            { name: 'fallback' },
          );

          expect(actual).toHaveProperty('name', 'custom');
        });
        it('should fail if given file does not exist', async () => {
          let actual = null;
          try {
            await current.getConfig('./does-not-exist.js', './tool.config.js', {
              name: 'fallback',
            });
          } catch (err) {
            actual = err;
          }

          expect(actual).toHaveProperty('code', 'ERR_MODULE_NOT_FOUND');
        });
        it('should allow passing absolute paths', async () => {
          const actual = await current.getConfig(
            current.hostGitPath('custom.js'),
            './tool.config.js',
            { name: 'fallback' },
          );

          expect(actual).toHaveProperty('name', 'custom');
        });
      });
      describe('with a fallback to the default file in the host', () => {
        it('should return the file in host if no path given', async () => {
          const actual = await current.getConfig(null, './tool.config.js', {
            name: 'fallback',
          });

          expect(actual).toHaveProperty('name', 'tool');
        });
        it('should allow passing absolute path to the file in the root', async () => {
          const actual = await current.getConfig(
            null,
            current.hostGitPath('tool.config.js'),
            {
              name: 'fallback',
            },
          );

          expect(actual).toHaveProperty('name', 'tool');
        });
      });
      describe('with a final fallback to the template if no default host file found', () => {
        it('should return the final fallback if no host file passed', async () => {
          const actual = await current.getConfig(null, null, {
            name: 'fallback',
          });

          expect(actual).toHaveProperty('name', 'fallback');
        });
        it('should return the final fallback if no host file found', async () => {
          const actual = await current.getConfig(
            null,
            './does-not-exist.config.js',
            {
              name: 'fallback',
            },
          );

          expect(actual).toHaveProperty('name', 'fallback');
        });
      });
    });
  });
});
