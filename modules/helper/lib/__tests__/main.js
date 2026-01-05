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
      await newFile(`${testDirectory}/lib/assets/style.css`);

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
      {
        title: 'Specific path',
        pattern: '__tests__/module.js',
        expected: [`${testDirectory}/lib/__tests__/module.js`],
      },
      {
        title: 'Glob pattern',
        pattern: '__tests__/**/*.js',
        expected: [`${testDirectory}/lib/__tests__/module.js`],
      },
      {
        title: 'One dir',
        pattern: '__tests__',
        expected: [`${testDirectory}/lib/__tests__/module.js`],
      },
      {
        title: 'All files (no arg)',
        pattern: '',
        expected: [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/.nvmrc`,
          `${testDirectory}/lib/.tool/config.yml`,
          `${testDirectory}/lib/assets/style.css`,
        ],
      },
      {
        title: 'All files (dot arg)',
        pattern: '.',
        expected: [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/.nvmrc`,
          `${testDirectory}/lib/.tool/config.yml`,
          `${testDirectory}/lib/assets/style.css`,
        ],
      },
      {
        title: 'All files (** arg)',
        pattern: '**',
        expected: [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/.nvmrc`,
          `${testDirectory}/lib/.tool/config.yml`,
          `${testDirectory}/lib/assets/style.css`,
        ],
      },
      {
        title: 'Specific extension (.js)',
        pattern: '**',
        safeExtensions: ['.js'],
        expected: [`${testDirectory}/lib/__tests__/module.js`],
      },
      {
        title: 'Specific extension (js)',
        pattern: '**',
        safeExtensions: ['js'],
        expected: [`${testDirectory}/lib/__tests__/module.js`],
      },
      {
        title: 'Several extensions extension (.js)',
        pattern: '**',
        safeExtensions: ['.js', 'css'],
        expected: [
          `${testDirectory}/lib/__tests__/module.js`,
          `${testDirectory}/lib/assets/style.css`,
        ],
      },
      {
        title: 'dotfiles do not have an extension',
        pattern: '**',
        safeExtensions: ['.nvmrc'],
        expected: [],
      },
      {
        title: 'dotfiles only have a name',
        pattern: '**/.*rc',
        expected: [`${testDirectory}/lib/.nvmrc`],
      },
    ])('$title', async ({ pattern, expected, safeExtensions }) => {
      const actual = await current.findHostPackageFiles(
        pattern,
        safeExtensions,
      );
      expect(actual).toEqual(expected);
    });
  });

  fdescribe('getConfig', () => {
    beforeAll(async () => {
      // The package.json with type: module is required so I can import with
      // the export default syntax
      await writeJson({ type: 'module' }, `${testDirectory}/package.json`);
      await write(
        "export default { name: 'tool' }",
        `${testDirectory}/tool.config.js`,
      );
      await write(
        "export default { name: 'custom' }",
        `${testDirectory}/configs/custom.config.js`,
      );
    });
    afterAll(async () => {
      await remove(testDirectory);
    });
    it.each([
      {
        title: 'Priority to user-provided',
        input: ['configs/custom.config.js', 'tool.config.js'],
        expected: 'custom',
      },
    ])('$title', async ({ input, expected }) => {
      const actual = current.getConfig(...input, { name: 'fallback' });
      expect(actual).toHaveProperty('name', expected);
    });
    // describe('with a specific path given', () => {
    //   it('should give priority to the path given', async () => {
    //     const actual = await current.getConfig(
    //       './custom.js',
    //       './tool.config.js',
    //       { name: 'fallback' },
    //     );
    //
    //     expect(actual).toHaveProperty('name', 'custom');
    //   });
    //   it('should fail if given file does not exist', async () => {
    //     let actual = null;
    //     try {
    //       await current.getConfig('./does-not-exist.js', './tool.config.js', {
    //         name: 'fallback',
    //       });
    //     } catch (err) {
    //       actual = err;
    //     }
    //
    //     expect(actual).toHaveProperty('code', 'ERR_MODULE_NOT_FOUND');
    //   });
    //   it('should allow passing absolute paths', async () => {
    //     const actual = await current.getConfig(
    //       current.hostGitPath('custom.js'),
    //       './tool.config.js',
    //       { name: 'fallback' },
    //     );
    //
    //     expect(actual).toHaveProperty('name', 'custom');
    //   });
    // });
    // describe('with a fallback to the default file in the host', () => {
    //   it('should return the file in host if no path given', async () => {
    //     const actual = await current.getConfig(null, './tool.config.js', {
    //       name: 'fallback',
    //     });
    //
    //     expect(actual).toHaveProperty('name', 'tool');
    //   });
    //   it('should allow passing absolute path to the file in the root', async () => {
    //     const actual = await current.getConfig(
    //       null,
    //       current.hostGitPath('tool.config.js'),
    //       {
    //         name: 'fallback',
    //       },
    //     );
    //
    //     expect(actual).toHaveProperty('name', 'tool');
    //   });
    // });
    // describe('with a final fallback to the template if no default host file found', () => {
    //   it('should return the final fallback if no host file passed', async () => {
    //     const actual = await current.getConfig(null, null, {
    //       name: 'fallback',
    //     });
    //
    //     expect(actual).toHaveProperty('name', 'fallback');
    //   });
    //   it('should return the final fallback if no host file found', async () => {
    //     const actual = await current.getConfig(
    //       null,
    //       './does-not-exist.config.js',
    //       {
    //         name: 'fallback',
    //       },
    //     );
    //
    //     expect(actual).toHaveProperty('name', 'fallback');
    //   });
    // });
  });
});
