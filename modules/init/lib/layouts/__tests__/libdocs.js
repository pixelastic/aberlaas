import { exists, glob, readJson, remove, tmpDirectory } from 'firost';
import helper from 'aberlaas-helper';
import {
  nodeVersion,
  norskaThemeDocsVersion,
  norskaVersion,
  yarnVersion,
} from 'aberlaas-versions';
import current from '../libdocs.js';

describe('init > libdocs', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(
      tmpDirectory('aberlaas/init/libdocs'),
    );

    vi.spyOn(current, '__getProjectName').mockReturnValue('my-project');
    vi.spyOn(current, '__getProjectAuthor').mockReturnValue('my-name');
    vi.spyOn(current, '__getAberlaasVersion').mockReturnValue('1.2.3');
  });
  afterEach(async () => {
    await remove(helper.hostGitRoot());
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
      await current.createRootWorkspace();

      const actual = await readJson(helper.hostPath('package.json'));

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
      await current.createDocsWorkspace();

      const actual = await readJson(helper.hostPath('docs/package.json'));

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
      await current.createLibWorkspace();

      const actual = await readJson(helper.hostPath('lib/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  describe('addLicenseFiles', () => {
    it('creates license file in root and ./lib', async () => {
      await current.addLicenseFiles();

      expect(await exists(helper.hostPath('LICENSE'))).toBe(true);
      expect(await exists(helper.hostPath('lib/LICENSE'))).toBe(true);
    });
  });

  describe('run', () => {
    it('should build a libdocs structure', async () => {
      await current.run();

      const actual = await glob('**/*', {
        cwd: helper.hostPath(),
        absolutePaths: false,
        directories: false,
      });

      expect(actual).toEqual([
        '.circleci/config.yml',
        '.gitattributes',
        '.github/renovate.json',
        '.gitignore',
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
