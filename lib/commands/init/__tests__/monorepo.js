import { exists, glob, readJson, remove, tmpDirectory } from 'firost';
import current from '../monorepo.js';
import helper from '../../../helper.js';
import nodeConfig from '../../../configs/node.cjs';

const currentAberlaasVersion = (
  await readJson(helper.aberlaasPath('./package.json'))
).version;

describe('init > monorepo', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));

    vi.spyOn(current, '__getProjectName').mockReturnValue('my-project');
    vi.spyOn(current, '__getProjectAuthor').mockReturnValue('my-name');
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
  });

  // WORKSPACES
  describe('createRootWorkspace', () => {
    it.each([
      [
        'should have correct metadata',
        {
          name: 'my-project-monorepo',
          version: '0.0.1',
          author: 'my-name',
          description: 'my-project monorepo',
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
          packageManager: `yarn@${nodeConfig.yarnVersion}`,
          dependencies: {},
          devDependencies: {
            aberlaas: currentAberlaasVersion,
            lerna: nodeConfig.lernaVersion,
          },
          scripts: {
            build: './scripts/docs/build',
            release: './scripts/lib/release',
            lint: './scripts/lint',
            'g:build': './scripts/docs/build',
            'g:release': './scripts/lib/release',
            'g:lint': './scripts/lint',
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
            norska: nodeConfig.norskaVersion,
            'norska-theme-docs': nodeConfig.norskaThemeDocsVersion,
          },
          scripts: {
            build: 'ABERLAAS_CWD=$INIT_CWD yarn g:build',
            release: 'ABERLAAS_CWD=$INIT_CWD yarn g:release',
            lint: 'ABERLAAS_CWD=$INIT_CWD yarn g:lint',
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
          engines: {
            node: `>=${nodeConfig.nodeVersion}`,
          },

          files: ['*.js'],
          exports: { '.': './main.js' },
          // The main field is only used when there is no exports field, but not all
          // tools support exports (eslint-plugin-import for example has trouble
          // parsing it). Just to be safe, we add it as well.
          main: './main.js',

          devDependencies: {},
          dependencies: {},

          // Yarn script ran from a workspace lose the value of the INIT_CWD
          // variable before they call the workspace script, so we need to save it
          // in ABERLAAS_CWD beforehand.
          scripts: {
            build: 'ABERLAAS_CWD=$INIT_CWD yarn g:build',
            release: 'ABERLAAS_CWD=$INIT_CWD yarn g:release',
            lint: 'ABERLAAS_CWD=$INIT_CWD yarn g:lint',
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

  describe('addScripts', () => {
    it('creates docs scripts', async () => {
      await current.addScripts();

      const actual = await glob('./scripts/**', {
        context: helper.hostPath(),
        absolutePaths: false,
      });

      expect(actual).toInclude('./scripts/docs/build');
      expect(actual).toInclude('./scripts/docs/build-prod');
      expect(actual).toInclude('./scripts/docs/cms');
      expect(actual).toInclude('./scripts/docs/serve');
    });
  });
});
