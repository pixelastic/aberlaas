import {
  exists,
  glob,
  readJson,
  remove,
  tmpDirectory,
  writeJson,
} from 'firost';
import { hostGitPath, hostGitRoot, mockHelperPaths } from 'aberlaas-helper';
import {
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
} from 'aberlaas-versions';
import { __ as initHelper } from '../../helper.js';
import { __, run } from '../monorepo.js';

describe('init/monorepo', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);

    // Create a package.json with aberlaas in devDependencies
    await writeJson(
      { devDependencies: { aberlaas: '1.2.3' } },
      hostGitPath('package.json'),
    );

    vi.spyOn(initHelper, 'getProjectName').mockReturnValue('my-project');
    vi.spyOn(initHelper, 'getProjectAuthor').mockReturnValue('my-name');
  });
  afterEach(async () => {
    await remove(hostGitRoot());
  });

  // WORKSPACES
  describe('createRootWorkspace', () => {
    it.each([
      [
        'should have correct metadata',
        {
          name: 'my-project-monorepo',
          author: 'my-name',
          description: 'my-project monorepo',
          repository: {
            type: 'git',
            url: 'https://github.com/my-name/my-project',
          },
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have root specific data',
        {
          private: true,
          workspaces: ['modules/*'],
          type: 'module',
          packageManager: `yarn@${yarnVersion}`,
          devDependencies: {
            aberlaas: '1.2.3',
          },
          scripts: {
            build: './scripts/build',
            release: './scripts/release',
            lint: './scripts/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createRootWorkspace();

      const actual = await readJson(hostGitPath('package.json'));

      expect(actual).toMatchObject(expected);
    });
  });
  describe('createDocsWorkspace', () => {
    it.each([
      [
        'should have correct metadata',
        {
          name: 'my-project-docs',
          version: '0.0.1',
          author: 'my-name',
          description: 'my-project docs',
          repository: {
            type: 'git',
            url: 'https://github.com/my-name/my-project',
          },
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have docs specific data',
        {
          private: true,
          dependencies: {
            norska: norskaVersion,
            'norska-theme-docs': norskaThemeDocsVersion,
          },
          scripts: {
            build: 'cd ../.. && ./scripts/build',
            release: 'cd ../.. && ./scripts/release',
            lint: 'cd ../.. && ./scripts/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createDocsWorkspace();

      const actual = await readJson(hostGitPath('modules/docs/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });
  describe('createLibWorkspace', () => {
    it.each([
      [
        'should have correct metadata',
        {
          name: 'my-project',
          version: '0.0.1',
          author: 'my-name',
          description: 'my-project module',
          keywords: ['my-project'],
          repository: {
            type: 'git',
            url: 'https://github.com/my-name/my-project',
          },
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have lib specific data',
        {
          type: 'module',
          sideEffects: false,
          engines: {
            node: `>=${nodeVersion}`,
          },

          files: ['*.js'],
          exports: { '.': './main.js' },
          // Some tools have trouble parsing the .exports field, so we keep the
          // .main field for backward compatibility
          main: './main.js',

          scripts: {
            build: 'cd ../.. && ./scripts/build',
            release: 'cd ../.. && ./scripts/release',
            lint: 'cd ../.. && ./scripts/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createLibWorkspace();

      const actual = await readJson(hostGitPath('modules/lib/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  describe('addLicenseFiles', () => {
    it('creates license file in root and ./lib', async () => {
      await __.addLicenseFiles();

      expect(await exists(hostGitPath('LICENSE'))).toBe(true);
      expect(await exists(hostGitPath('modules/lib/LICENSE'))).toBe(true);
    });
  });

  describe('run', () => {
    it('should build a monorepo structure', async () => {
      await run();

      const actual = await glob('**/*', {
        cwd: hostGitPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.editorconfig',
        '.github/renovate.json',
        '.gitignore',
        '.README.template.md',
        '.yarnrc.yml',
        'eslint.config.js',
        'LICENSE',
        'lintstaged.config.js',
        'modules/docs/package.json',
        'modules/lib/__tests__/main.js',
        'modules/lib/LICENSE',
        'modules/lib/main.js',
        'modules/lib/package.json',
        'package.json',
        'prettier.config.js',
        'scripts/build',
        'scripts/build-prod',
        'scripts/ci',
        'scripts/cms',
        'scripts/compress',
        'scripts/hooks/pre-commit',
        'scripts/lint',
        'scripts/lint-fix',
        'scripts/release',
        'scripts/serve',
        'scripts/test',
        'scripts/test-watch',
        'stylelint.config.js',
        'vite.config.js',
      ]);
    });
  });
});
