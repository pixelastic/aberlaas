import Gilmore from 'gilmore';
import current from '../index.js';
import helper from '../../../helper.js';
import emptyDir from 'firost/emptyDir.js';
import remove from 'firost/remove.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import tmpDirectory from 'firost/tmpDirectory.js';
import isFile from 'firost/isFile.js';
import readJson from 'firost/readJson.js';
import nodeConfig from '../../../configs/node.cjs';

const currentAberlaasVersion = (
  await readJson(helper.aberlaasPath('./package.json'))
).version;

describe('init', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, for all
    // git/yarn related command to work so we put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));
  });
  afterEach(async () => {
    await remove(helper.hostRoot());
  });
  // CONFIGURE
  describe('configureGit', () => {
    it('should change the default git hooksPath', async () => {
      const repo = new Gilmore(helper.hostRoot());
      await repo.init();

      await current.configureGit();

      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('configureNode', () => {
    it('should set a .nvmrc file', async () => {
      await current.configureNode();

      const actual = await read(helper.hostPath('.nvmrc'));

      expect(actual).toEqual(nodeConfig.nodeVersion);
    });
  });

  // WORKSPACES
  describe('createRootWorkspace', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'getSharedProjectData').mockReturnValue({
        name: 'my-project',
      });
      await current.createRootWorkspace();
    });
    it.each([
      ['should be private', { private: true }],
      ['should have two workspaces', { workspaces: ['docs', 'lib'] }],
      ['should be named as a monorepo', { name: 'my-project-monorepo' }],
      ['should be esm', { type: 'module' }],
      [
        'should use latest yarn',
        { packageManager: `yarn@${nodeConfig.yarnVersion}` },
      ],
      [
        'should use aberlaas and lerna',
        {
          devDependencies: {
            aberlaas: currentAberlaasVersion,
            lerna: nodeConfig.lernaVersion,
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual).toMatchObject(expected);
    });
  });
  describe('createDocsWorkspace', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'getSharedProjectData').mockReturnValue({
        name: 'my-project',
      });
      await current.createDocsWorkspace();
    });
    it.each([
      ['should be private', { private: true }],
      ['should be named as a docs', { name: 'my-project-docs' }],
      [
        'should use norska',
        {
          dependencies: {
            norska: nodeConfig.norskaVersion,
            'norska-theme-docs': nodeConfig.norskaThemeDocsVersion,
          },
        },
      ],
    ])('%s', async (_title, expected) => {
      const actual = await readJson(helper.hostPath('docs/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });
  describe('createLibWorkspace', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'getProjectName').mockReturnValue('my-project');
      vi.spyOn(current, 'getProjectAuthor').mockReturnValue('myself');

      await current.createLibWorkspace();
    });
    it.each([
      ['should not be private', { private: false }],
      ['should have the name of the github project', { name: 'my-project' }],
      ['should have the author as the github author', { author: 'myself' }],
      ['should be esm', { type: 'module' }],
      ['should package all .js files', { files: ['*.js'] }],
      ['should export main.js', { exports: { '.': './main.js' } }],
      // The main field is only used when there is no exports field, but not all
      // tools support exports (eslint-plugin-import for example has trouble
      // parsing it). Just to be safe, we add it as well.
      ['should have a main field', { main: './main.js' }],
      // Yarn script ran from a workspace lose the value of the INIT_CWD
      // variable before they call the workspace script, so we need to save it
      // in ABERLAAS_CWD beforehand
      [
        'should pass current directory to workspace root scripts',
        { scripts: { lint: 'ABERLAAS_CWD=$INIT_CWD yarn g:lint' } },
      ],
    ])('%s', async (_title, expected) => {
      const actual = await readJson(helper.hostPath('lib/package.json'));

      expect(actual).toMatchObject(expected);
    });
  });

  // FILES
  describe('addConfigFiles', () => {
    it.each([
      ['CircleCI config', '.circleci/config.yml'],
      ['ESLint config', '.eslintrc.cjs'],
      ['ESLint ignore', '.eslintignore'],
      ['Git attributes', '.gitattributes'],
      ['Git ignore', '.gitignore'],
      ['Lerna config', 'lerna.json'],
      ['LintStaged config', 'lintstaged.config.js'],
      ['Prettier config', 'prettier.config.js'],
      ['Renovate config', '.github/renovate.json'],
      ['Stylelint config', 'stylelint.config.js'],
      ['Vite config', 'vite.config.js'],
      ['Yarn config', '.yarnrc.yml'],
    ])('%s', async (_title, filepath) => {
      await current.addConfigFiles();
      const actual = await isFile(helper.hostPath(filepath));
      expect(actual).toBe(true);
    });
  });
  describe('addScripts', () => {
    it.each([
      ['build', 'docs/build'],
      ['build:prod', 'docs/build-prod'],
      ['cms', 'docs/cms'],
      ['serve', 'docs/serve'],
      ['pre-commit', 'hooks/pre-commit'],
      ['release', 'lib/release'],
      ['test', 'lib/test'],
      ['test:watch', 'lib/test-watch'],
      ['ci', 'ci'],
      ['lint', 'lint'],
      ['lint:fix', 'lint-fix'],
      ['compress', 'compress'],
    ])('%s', async (_title, filepath) => {
      await current.addScripts();
      const actual = await isFile(helper.hostPath(`scripts/${filepath}`));
      expect(actual).toBe(true);
    });
  });
  describe('addLicenseFiles', () => {
    it.each([['./LICENSE'], ['./lib/LICENSE']])('%s', async (filepath) => {
      vi.spyOn(current, 'getSharedProjectData').mockReturnValue({
        author: 'pixelastic',
      });

      await current.addLicenseFiles();

      const actual = await read(helper.hostPath(filepath));
      expect(actual).toInclude('Copyright (c) pixelastic');
    });
  });
  describe('addLibFiles', () => {
    it('should include the minimum files', async () => {
      await current.addLibFiles();

      const hasMain = await isFile(helper.hostPath('lib/main.js'));
      expect(hasMain).toBe(true);
      const hasTest = await isFile(helper.hostPath('lib/__tests__/main.js'));
      expect(hasTest).toBe(true);
    });
  });

  describe('copyToHost', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'aberlaasRoot').mockReturnValue('./tmp/aberlaas');
      await emptyDir(helper.aberlaasRoot());
    });
    it('should copy file from aberlaas to host', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));

      await current.copyToHost('config.yml', '.configrc');

      const actual = await read(helper.hostPath('.configrc'));
      expect(actual).toBe('config: true');
    });
    it('should return true if file copied', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));

      const actual = await current.copyToHost('config.yml', '.configrc');

      expect(actual).toBe(true);
    });
    it('should throw an error if source does not exist', async () => {
      let actual = null;

      try {
        await current.copyToHost('config.yml', '.configrc');
      } catch (error) {
        actual = error;
      }

      expect(actual).not.toBeNull();
    });
    it('should create a backup copy of destination if already exists', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));
      await write('config: 42', helper.hostPath('.configrc'));

      await current.copyToHost('config.yml', '.configrc');

      const configContent = await read(helper.hostPath('.configrc'));
      expect(configContent).toBe('config: true');

      const backupContent = await read(helper.hostPath('.configrc.backup'));
      expect(backupContent).toBe('config: 42');
    });
    it('should not create a backup if the source and destination have the same content', async () => {
      await write('config: true', helper.aberlaasPath('config.yml'));
      await write('config: true', helper.hostPath('.configrc'));

      await current.copyToHost('config.yml', '.configrc');

      const configExist = await isFile(helper.hostPath('.configrc'));
      expect(configExist).toBe(true);

      const backupExist = await isFile(helper.hostPath('.configrc.backup'));
      expect(backupExist).toBe(false);
    });
  });
});
