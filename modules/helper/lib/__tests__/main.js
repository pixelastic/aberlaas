import { newFile, remove, tmpDirectory, write, writeJson } from 'firost';
import {
  __,
  findHostPackageFiles,
  getConfig,
  hostGitPath,
  hostPackagePath,
} from '../main.js';

describe('helper', () => {
  const testDirectory = tmpDirectory('aberlaas/helper');

  beforeEach(async () => {
    // Those are tested in ./yarnRun.js, so we can just mock them here
    vi.spyOn(__, 'hostGitRoot').mockReturnValue(testDirectory);
    vi.spyOn(__, 'hostPackageRoot').mockReturnValue(`${testDirectory}/lib`);
    vi.spyOn(__, 'hostWorkingDirectory').mockReturnValue(
      `${testDirectory}/lib/src`,
    );
  });

  describe('hostGitPath', () => {
    it.each([
      { title: 'Empty input', input: '', expected: `${testDirectory}` },
      {
        title: 'Direct child',
        input: 'package.json',
        expected: `${testDirectory}/package.json`,
      },
      {
        title: 'Deep child',
        input: 'lib/src/main.js',
        expected: `${testDirectory}/lib/src/main.js`,
      },
      {
        title: 'Deep and using ../..',
        input: 'lib/src/../../package.json',
        expected: `${testDirectory}/package.json`,
      },
    ])('$title', async ({ input, expected }) => {
      const actual = hostGitPath(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('hostPackagePath', () => {
    it.each([
      { title: 'Empty input', input: '', expected: `${testDirectory}/lib` },
      {
        title: 'Direct child',
        input: 'package.json',
        expected: `${testDirectory}/lib/package.json`,
      },
      {
        title: 'Deep child',
        input: 'src/main.js',
        expected: `${testDirectory}/lib/src/main.js`,
      },
      {
        title: 'Deep and using ../',
        input: 'src/../package.json',
        expected: `${testDirectory}/lib/package.json`,
      },
      {
        title: 'Going to parent',
        input: '../package.json',
        expected: `${testDirectory}/package.json`,
      },
    ])('$title', async ({ input, expected }) => {
      const actual = hostPackagePath(input);
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
      const actual = await findHostPackageFiles(pattern, safeExtensions);
      expect(actual).toEqual(expected);
    });
  });

  describe('getConfig', () => {
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
      // User-provided
      {
        title: 'Priority to user-provided',
        input: ['configs/custom.config.js', 'tool.config.js'],
        expected: 'custom',
      },
      {
        title: 'Works with absolute paths',
        input: [`${testDirectory}/configs/custom.config.js`, 'tool.config.js'],
        expected: 'custom',
      },
      // Host default
      {
        title: 'Fallback to host default if no user-provided',
        input: [null, 'tool.config.js'],
        expected: 'tool',
      },
      {
        title: 'Fallback to absolute host default if no user-provided',
        input: [null, `${testDirectory}/tool.config.js`],
        expected: 'tool',
      },
      // Aberlaas fallback
      {
        title: 'Final fallback to aberlaas if none are passed',
        input: [null, null],
        expected: 'aberlaas',
      },
      {
        title: 'Final fallback to aberlaas if host file is missing',
        input: [null, 'missing.config.js'],
        expected: 'aberlaas',
      },
    ])('$title', async ({ input, expected }) => {
      const actual = await getConfig(...input, { name: 'aberlaas' });
      expect(actual).toHaveProperty('name', expected);
    });
    it('should throw an error if user config does not exist', async () => {
      let actual = null;
      try {
        await getConfig('config/missing.config.js', 'tool.config.js', {
          name: 'aberlaas',
        });
      } catch (err) {
        actual = err;
      }
      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_HELPER_GET_CONFIG_USER_PROVIDED_NOT_FOUND',
      );
    });
  });
});
