import { exists, glob, readJson, remove, tmpDirectory } from 'firost';
import { hostGitPath, hostGitRoot, mockHelperPaths } from 'aberlaas-helper';
import {
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
} from 'aberlaas-versions';
import { __ as initHelper } from '../../helper.js';
import { __, run } from '../libdocs.js';

describe('init > libdocs', () => {
  const testDirectory = tmpDirectory('aberlaas/init/libdocs');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);

    vi.spyOn(initHelper, 'getProjectName').mockReturnValue('my-project');
    vi.spyOn(initHelper, 'getProjectAuthor').mockReturnValue('my-name');
    vi.spyOn(initHelper, 'getAberlaasVersion').mockReturnValue('1.2.3');
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
          name: 'my-project-root',
          author: 'my-name',
          description: 'my-project root workspace',
          repository: 'my-name/my-project',
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have root specific data',
        {
          private: true,
          workspaces: ['docs', 'lib'],
          type: 'module',
          packageManager: `yarn@${yarnVersion}`,
          dependencies: {},
          devDependencies: {
            aberlaas: '1.2.3',
          },
          scripts: {
            build: './scripts/meta/build',
            release: './scripts/meta/release',
            lint: './scripts/meta/lint',
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
          repository: 'my-name/my-project',
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have docs specific data',
        {
          private: true,
          devDependencies: {},
          dependencies: {
            norska: norskaVersion,
            'norska-theme-docs': norskaThemeDocsVersion,
          },
          scripts: {
            build: '../scripts/local/build',
            release: '../scripts/local/release',
            lint: '../scripts/local/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createDocsWorkspace();

      const actual = await readJson(hostGitPath('docs/package.json'));

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
          description: '',
          keywords: [],
          repository: 'my-name/my-project',
          homepage: 'https://projects.pixelastic.com/my-project',
          license: 'MIT',
        },
      ],
      [
        'should have lib specific data',
        {
          private: false,
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

          devDependencies: {},
          dependencies: {},

          scripts: {
            build: '../scripts/local/build',
            release: '../scripts/local/release',
            lint: '../scripts/local/lint',
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      await __.createLibWorkspace();

      const actual = await readJson(hostGitPath('lib/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  describe('addLicenseFiles', () => {
    it('creates license file in root and ./lib', async () => {
      await __.addLicenseFiles();

      expect(await exists(hostGitPath('LICENSE'))).toBe(true);
      expect(await exists(hostGitPath('lib/LICENSE'))).toBe(true);
    });
  });

  describe('run', () => {
    vi.setConfig({ testTimeout: 10_000 });
    it('should build a libdocs structure', async () => {
      await run();

      const actual = await glob('**/*', {
        cwd: hostGitPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.editorconfig',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
        '.README.template.md',
        '.yarnrc.yml',
        'docs/package.json',
        'eslint.config.js',
        'lib/__tests__/main.js',
        'lib/LICENSE',
        'lib/main.js',
        'lib/package.json',
        'LICENSE',
        'lintstaged.config.js',
        'package.json',
        'prettier.config.js',
        'scripts/hooks/pre-commit',
        'scripts/local/build',
        'scripts/local/build-prod',
        'scripts/local/ci',
        'scripts/local/cms',
        'scripts/local/compress',
        'scripts/local/lint',
        'scripts/local/lint-fix',
        'scripts/local/release',
        'scripts/local/serve',
        'scripts/local/test',
        'scripts/local/test-watch',
        'scripts/meta/build',
        'scripts/meta/build-prod',
        'scripts/meta/ci',
        'scripts/meta/cms',
        'scripts/meta/compress',
        'scripts/meta/lint',
        'scripts/meta/lint-fix',
        'scripts/meta/release',
        'scripts/meta/serve',
        'scripts/meta/test',
        'scripts/meta/test-watch',
        'stylelint.config.js',
        'vite.config.js',
      ]);
    });
  });
});
