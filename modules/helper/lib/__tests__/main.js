import { newFile, remove, tmpDirectory, write, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import current from '../main.js';

describe('current', () => {
  const testDirectory = tmpDirectory('aberlaas/helper');

  beforeEach(async () => {
    // Those are tested in ./yarnRun.js, so we can just mock them here
    vi.spyOn(current, 'hostGitRoot').mockReturnValue(testDirectory);
    vi.spyOn(current, 'hostPackageRoot').mockReturnValue(
      `${testDirectory}/lib`,
    );
    vi.spyOn(current, 'hostWorkingDirectory').mockReturnValue(
      `${testDirectory}/lib/src`,
    );
  });

  describe('hostGitPath', () => {
    it.each([
      ['', `${testDirectory}`],
      ['package.json', `${testDirectory}/package.json`],
      ['lib/src/main.js', `${testDirectory}/lib/src/main.js`],
      ['lib/src/../../package.json', `${testDirectory}/package.json`],
    ])('%s', async (input, expected) => {
      const actual = current.hostGitPath(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('hostPackagePath', () => {
    it.each([
      ['', `${testDirectory}/lib`],
      ['package.json', `${testDirectory}/lib/package.json`],
      ['src/main.js', `${testDirectory}/lib/src/main.js`],
      ['src/../package.json', `${testDirectory}/lib/package.json`],
      ['../package.json', `${testDirectory}/package.json`],
    ])('%s', async (input, expected) => {
      const actual = current.hostPackagePath(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('findHostPackageFiles', () => {
    beforeAll(async () => {
      await newFile(`${testDirectory}/lib/__tests__/module.js`);
      await newFile(`${testDirectory}/lib/.nvmrc`);
      await newFile(`${testDirectory}/lib/.tool/config.yml`);

      // Useless files that should be ignored
      await newFile(`${testDirectory}/lib/build/main.js`);
      await newFile(`${testDirectory}/lib/dist/index.html`);
      await newFile(`${testDirectory}/lib/fixtures/test.js`);
      await newFile(`${testDirectory}/lib/node_modules/firost/package.json`);
      await newFile(`${testDirectory}/lib/tmp/debug.log`);
      await newFile(`${testDirectory}/lib/vendors/jQuery.js`);
      await newFile(`${testDirectory}/lib/.claude/settings.local.json`);
      await newFile(`${testDirectory}/lib/.git/HEAD`);
      await newFile(`${testDirectory}/lib/.next/build-manifest.json`);
      await newFile(`${testDirectory}/lib/.turbo/preferences/tui.json`);
      await newFile(`${testDirectory}/lib/.yarn/install-state.gz`);
    });
    afterAll(async () => {
      await remove(testDirectory);
    });
    it.each([
      [
        'Specific path',
        '__tests__/module.js',
        [`${testDirectory}/lib/__tests__/module.js`],
      ],
      [
        'Glob pattern',
        '__tests__/**/*.js',
        [`${testDirectory}/lib/__tests__/module.js`],
      ],
      ['One dir', '__tests__', [`${testDirectory}/lib/__tests__/module.js`]],
      [
        'All files (no arg)',
        '',
        [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/.nvmrc`,
          `${testDirectory}/lib/.tool/config.yml`,
        ],
      ],
      [
        'All files (dot arg)',
        '.',
        [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/.nvmrc`,
          `${testDirectory}/lib/.tool/config.yml`,
        ],
      ],
    ])('%s: %s', async (_title, input, expected) => {
      const actual = await current.findHostPackageFiles(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('with hostGitRoot mocked', () => {
    describe('findHostFiles', () => {
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
