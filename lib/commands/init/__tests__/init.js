import path from 'path';
import Gilmore from 'gilmore';
import current from '../index.js';
import helper from '../../../helper.js';
import emptyDir from 'firost/emptyDir.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import tmpDirectory from 'firost/tmpDirectory.js';
import isFile from 'firost/isFile.js';
import writeJson from 'firost/writeJson.js';
import readJson from 'firost/readJson.js';
import nodeConfig from '../../../configs/node.cjs';

describe('init', () => {
  beforeEach(async () => {
    // We need to make the tmp directory outside of this git repo tree, so we
    // put it in a /tmp directory
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory('aberlaas/init'));

    await emptyDir(helper.hostRoot());
  });
  afterEach(async () => {
    await emptyDir(helper.hostRoot());
  });
  describe('copyToHost', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'aberlaasRoot').mockReturnValue('./tmp/aberlaas');
      await emptyDir(helper.aberlaasRoot());
    });
    it('should copy file from aberlaas to host', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));

      await current.copyToHost('foo.js', 'bar.js');

      const actual = await read(helper.hostPath('bar.js'));
      expect(actual).toBe('foo');
    });
    it('should return true if file copied', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));

      const actual = await current.copyToHost('foo.js', 'bar.js');

      expect(actual).toBe(true);
    });
    it('should return false if source does not exist', async () => {
      const actual = await current.copyToHost('foo.js', 'bar.js');

      expect(actual).toBe(false);
    });
    it('should return false if destination already exist', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));
      await write('bar', helper.hostPath('bar.js'));

      const actual = await current.copyToHost('foo.js', 'bar.js');

      expect(actual).toBe(false);
    });
  });
  describe('addConfigFiles', () => {
    it.each([
      ['CircleCI config', '.circleci/config.yml'],
      ['ESLint config', '.eslintrc.cjs'],
      ['ESLint ignore', '.eslintignore'],
      ['LintStaged config', '.lintstagedrc.cjs'],
      ['Prettier config', '.prettierrc.cjs'],
      ['Renovate config', '.github/renovate.json'],
      ['Stylelint config', '.stylelintrc.cjs'],
      ['Vite config', 'vite.config.js'],
      ['Yarn config', '.yarnrc.yml'],
    ])('%s', async (_title, filepath) => {
      await current.addConfigFiles();
      const actual = await isFile(helper.hostPath(filepath));
      expect(actual).toBe(true);
    });
  });
  describe('addPackageScript', () => {
    it('should return false if entry in package.json scripts already exist', async () => {
      await writeJson(
        { scripts: { foo: 'bar' } },
        helper.hostPath('package.json'),
      );

      const actual = await current.addPackageScript('foo', 'scripts/lint');

      expect(actual).toBe(false);
    });
    it('should add an entry to the package.json scripts keys', async () => {
      await writeJson({}, helper.hostPath('package.json'));

      await current.addPackageScript('lint', 'scripts/lint');

      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual).toHaveProperty('scripts.lint', './scripts/lint');
    });
    it('should copy script to the host ./scripts directory', async () => {
      await writeJson({}, helper.hostPath('package.json'));

      await current.addPackageScript('lint', 'scripts/lint');

      const actual = await isFile(helper.hostPath('scripts/lint'));

      expect(actual).toBe(true);
    });
  });
  describe('addScripts', () => {
    it.each([
      ['ci', 'scripts/ci'],
      ['lint', 'scripts/lint'],
      ['lint:fix', 'scripts/lint-fix'],
      ['release', 'scripts/release'],
      ['test', 'scripts/test'],
      ['test:watch', 'scripts/test-watch'],
    ])('yarn run %s', async (scriptName, filepath) => {
      await writeJson({}, helper.hostPath('package.json'));
      await current.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath(filepath));

      expect(packageJson).toHaveProperty(
        `scripts.${scriptName}`,
        `./${filepath}`,
      );
      expect(fileCreated).toBe(true);
    });
  });
  describe('configureGitHooks', () => {
    beforeEach(async () => {
      const repo = new Gilmore(helper.hostRoot());
      await repo.init();
    });
    it('should copy the pre-commit file', async () => {
      await current.configureGitHooks();

      const fileCreated = await isFile(
        helper.hostPath('scripts/hooks/pre-commit'),
      );
      expect(fileCreated).toBe(true);
    });
    it('should change the default git hooksPath', async () => {
      await current.configureGitHooks();

      const repo = new Gilmore(helper.hostRoot());
      const actual = await repo.getConfig('core.hooksPath');
      expect(actual).toBe('scripts/hooks');
    });
  });
  describe('setDefaultReleaseFiles', () => {
    describe('main entrypoint', () => {
      it('should be lib/main.js if empty', async () => {
        await writeJson({}, helper.hostPath('package.json'));
        await current.setDefaultReleaseFiles();

        const packageContent = await readJson(helper.hostPath('package.json'));
        const hasFile = await isFile(helper.hostPath('./lib/main.js'));
        const hasTestFile = await isFile(
          helper.hostPath('./lib/__tests__/main.js'),
        );

        expect(packageContent.main).toBe('lib/main.js');
        expect(hasFile).toBe(true);
        expect(hasTestFile).toBe(true);
      });
      it('should be lib/main.js if default value', async () => {
        await writeJson({ main: 'index.js' }, helper.hostPath('package.json'));
        await current.setDefaultReleaseFiles();

        const packageContent = await readJson(helper.hostPath('package.json'));
        const hasFile = await isFile(helper.hostPath('./lib/main.js'));
        const hasTestFile = await isFile(
          helper.hostPath('./lib/__tests__/main.js'),
        );

        expect(packageContent.main).toBe('lib/main.js');
        expect(hasFile).toBe(true);
        expect(hasTestFile).toBe(true);
      });
      it('should not be changed if already set', async () => {
        await writeJson(
          { main: 'lib/custom.js' },
          helper.hostPath('package.json'),
        );
        await current.setDefaultReleaseFiles();

        const packageContent = await readJson(helper.hostPath('package.json'));
        const hasFile = await isFile(helper.hostPath('./lib/main.js'));
        const hasTestFile = await isFile(
          helper.hostPath('./lib/__tests__/main.js'),
        );

        expect(packageContent.main).toBe('lib/custom.js');
        expect(hasFile).toBe(false);
        expect(hasTestFile).toBe(false);
      });
    });
    describe('exported files', () => {
      it('should include lib/*.js if not set', async () => {
        await writeJson({}, helper.hostPath('package.json'));
        await current.setDefaultReleaseFiles();

        const actual = await readJson(helper.hostPath('package.json'));

        expect(actual.files).toContain('lib/*.js');
      });
      it('should include lib/*.js if empty', async () => {
        await writeJson({ files: [] }, helper.hostPath('package.json'));
        await current.setDefaultReleaseFiles();

        const actual = await readJson(helper.hostPath('package.json'));

        expect(actual.files).toContain('lib/*.js');
      });
      it('should not be modified if already set', async () => {
        await writeJson({ files: ['build'] }, helper.hostPath('package.json'));
        await current.setDefaultReleaseFiles();

        const actual = await readJson(helper.hostPath('package.json'));

        expect(actual.files).toEqual(['build']);
      });
    });
  });
  describe('addLicenseFile', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json'),
      );
    });
    it('should create an MIT LICENSE file', async () => {
      await current.addLicenseFile();

      const actual = await isFile(helper.hostPath('LICENSE'));

      expect(actual).toBe(true);
    });
    it('should be copyrighted by the author', async () => {
      await current.addLicenseFile();

      const actual = await read(helper.hostPath('LICENSE'));

      expect(actual).toInclude('Copyright (c) Foo <foo@bar.com>');
    });
    it('should not replace existing license', async () => {
      await write('existing license', helper.hostPath('LICENSE'));

      await current.addLicenseFile();

      const actual = await read(helper.hostPath('LICENSE'));

      expect(actual).toBe('existing license');
    });
  });
  describe('addLicenseField', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json'),
      );
    });
    it('should keep the existing license', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.license = 'customLicense';
      await writeJson(packageJson, packagePath);

      await current.addLicenseField();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('license', 'customLicense');
    });
    it('should set the license to MIT if not set', async () => {
      const packagePath = helper.hostPath('package.json');

      await current.addLicenseField();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('license', 'MIT');
    });
  });
  describe('addDefaultVersion', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json'),
      );
    });
    it('should keep the existing version', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.version = '1.2.3';
      await writeJson(packageJson, packagePath);

      await current.addDefaultVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('version', '1.2.3');
    });
    it('should add a 0.0.1 version if none defined', async () => {
      const packagePath = helper.hostPath('package.json');

      await current.addDefaultVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('version', '0.0.1');
    });
  });
  describe('addEngineNodeVersion', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json'),
      );
    });
    it('should keep the existing version', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.engines = { node: '42.0.0' };
      await writeJson(packageJson, packagePath);

      await current.addEngineNodeVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('engines.node', '42.0.0');
    });
    it('should add a 0.0.1 version if none defined', async () => {
      const packagePath = helper.hostPath('package.json');

      await current.addEngineNodeVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty(
        'engines.node',
        `>=${nodeConfig.nodeVersion}`,
      );
    });
  });
  describe('addDefaultName', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json'),
      );
    });
    it('should keep the existing name', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.name = 'foobar';
      await writeJson(packageJson, packagePath);

      await current.addDefaultName();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('name', 'foobar');
    });
    it('should add the dirname if no name defined', async () => {
      const packagePath = helper.hostPath('package.json');

      await current.addDefaultName();

      const actual = await readJson(packagePath);
      const expected = path.basename(helper.hostRoot());

      expect(actual).toHaveProperty('name', expected);
    });
  });
  describe('pinNodeAndYarn', () => {
    beforeEach(async () => {
      await writeJson({}, helper.hostPath('package.json'));
      vi.spyOn(current, '__run').mockReturnValue();
    });
    describe('node', () => {
      it('should set a .nvmrc file', async () => {
        await current.pinNodeAndYarn();

        const actual = await read(helper.hostPath('.nvmrc'));

        expect(actual).toEqual(nodeConfig.nodeVersion);
      });
    });
    describe('yarn', () => {
      it('should install latest yarn version', async () => {
        await current.pinNodeAndYarn();

        expect(current.__run).toHaveBeenCalledWith('yarn set version', {
          stdout: false,
        });
      });
    });
  });
});
