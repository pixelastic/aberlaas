const module = require('../init');
const helper = require('../../helper');
const emptyDir = require('firost/lib/emptyDir');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const isFile = require('firost/lib/isFile');
const writeJson = require('firost/lib/writeJson');
const readJson = require('firost/lib/readJson');

describe('init', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/host');

    await emptyDir(helper.hostRoot());
  });
  describe('copyToHost', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./tmp/aberlaas');
      await emptyDir(helper.aberlaasRoot());
    });
    it('should copy file from aberlaas to host', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));

      await module.copyToHost('foo.js', 'bar.js');

      const actual = await read(helper.hostPath('bar.js'));
      expect(actual).toEqual('foo');
    });
    it('should return true if file copied', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));

      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(true);
    });
    it('should return false if source does not exist', async () => {
      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(false);
    });
    it('should return false if destination already exist', async () => {
      await write('foo', helper.aberlaasPath('foo.js'));
      await write('bar', helper.hostPath('bar.js'));

      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(false);
    });
  });
  describe('addConfigFiles', () => {
    it('should add eslint config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.eslintrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add eslint ignore file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.eslintignore'));

      expect(actual).toEqual(true);
    });
    it('should add jest config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('jest.config.js'));

      expect(actual).toEqual(true);
    });
    it('should add husky config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.huskyrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add stylelint config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.stylelintrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add prettier config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.prettierrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add renovate config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.github/renovate.json'));

      expect(actual).toEqual(true);
    });
    it('should add circleci config file', async () => {
      await module.addConfigFiles();

      const actual = await isFile(helper.hostPath('.circleci/config.yml'));

      expect(actual).toEqual(true);
    });
  });
  describe('addPackageScript', () => {
    it('should return false if entry in package.json scripts already exist', async () => {
      await writeJson(
        { scripts: { foo: 'bar' } },
        helper.hostPath('package.json')
      );

      const actual = await module.addPackageScript('foo', 'scripts/lint');

      expect(actual).toEqual(false);
    });
    it('should add an entry to the package.json scripts keys', async () => {
      await writeJson({}, helper.hostPath('package.json'));

      await module.addPackageScript('lint', 'scripts/lint');

      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual).toHaveProperty('scripts.lint', './scripts/lint');
    });
    it('should copy script to the host ./scripts directory', async () => {
      await writeJson({}, helper.hostPath('package.json'));

      await module.addPackageScript('lint', 'scripts/lint');

      const actual = await isFile(helper.hostPath('scripts/lint'));

      expect(actual).toEqual(true);
    });
  });
  describe('addScripts', () => {
    beforeEach(async () => {
      await writeJson({}, helper.hostPath('package.json'));
    });
    it('should add lint script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/lint'));

      expect(packageJson).toHaveProperty('scripts.lint', './scripts/lint');
      expect(fileCreated).toEqual(true);
    });
    it('should add lint:fix script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/lint-fix'));

      expect(packageJson).toHaveProperty(
        'scripts.lint:fix',
        './scripts/lint-fix'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add release script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/release'));

      expect(packageJson).toHaveProperty(
        'scripts.release',
        './scripts/release'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add test script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/test'));

      expect(packageJson).toHaveProperty('scripts.test', './scripts/test');
      expect(fileCreated).toEqual(true);
    });
    it('should add test:watch script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/test-watch'));

      expect(packageJson).toHaveProperty(
        'scripts.test:watch',
        './scripts/test-watch'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add ci script', async () => {
      await module.addScripts();

      const packageJson = await readJson(helper.hostPath('package.json'));
      const fileCreated = await isFile(helper.hostPath('scripts/ci'));

      expect(packageJson).toHaveProperty('scripts.ci', './scripts/ci');
      expect(fileCreated).toEqual(true);
    });
  });
  describe('addScaffolding', () => {
    it('should add ./lib/main.js', async () => {
      await module.addScaffolding();

      const actual = await isFile(helper.hostPath('./lib/main.js'));

      expect(actual).toEqual(true);
    });
    it('should add ./lib/__tests__/main.js', async () => {
      await module.addScaffolding();

      const actual = await isFile(helper.hostPath('./lib/__tests__/main.js'));

      expect(actual).toEqual(true);
    });
    it('should not change files that already exist', async () => {
      await write('foo', helper.hostPath('./lib/main.js'));
      await module.addScaffolding();

      const actual = await read(helper.hostPath('./lib/main.js'));

      expect(actual).toEqual('foo');
    });
  });
  describe('setDefaultReleaseFiles', () => {
    beforeEach(async () => {
      await writeJson({}, helper.hostPath('package.json'));
    });
    it('should set .main key to lib/main.js', async () => {
      await module.setDefaultReleaseFiles();

      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual.main).toEqual('lib/main.js');
    });
    it('should set .files key to ["lib/*.js"]', async () => {
      await module.setDefaultReleaseFiles();

      const actual = await readJson(helper.hostPath('package.json'));

      expect(actual.files).toContain('lib/*.js');
    });
  });
  describe('addLicenseFile', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json')
      );
    });
    it('should create an MIT LICENSE file', async () => {
      await module.addLicenseFile();

      const actual = await isFile(helper.hostPath('LICENSE'));

      expect(actual).toEqual(true);
    });
    it('should be copyrighted by the author', async () => {
      await module.addLicenseFile();

      const actual = await read(helper.hostPath('LICENSE'));

      expect(actual).toInclude('Copyright (c) Foo <foo@bar.com>');
    });
    it('should not replace existing license', async () => {
      await write('existing license', helper.hostPath('LICENSE'));

      await module.addLicenseFile();

      const actual = await read(helper.hostPath('LICENSE'));

      expect(actual).toEqual('existing license');
    });
  });
  describe('addDefaultVersion', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json')
      );
    });
    it('should keep the existing version', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.version = '1.2.3';
      await writeJson(packageJson, packagePath);

      await module.addDefaultVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('version', '1.2.3');
    });
    it('should add a 0.0.1 version if none defined', async () => {
      const packagePath = helper.hostPath('package.json');

      await module.addDefaultVersion();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('version', '0.0.1');
    });
  });
  describe('addDefaultName', () => {
    beforeEach(async () => {
      await writeJson(
        { author: 'Foo <foo@bar.com>' },
        helper.hostPath('package.json')
      );
    });
    it('should keep the existing name', async () => {
      const packagePath = helper.hostPath('package.json');
      const packageJson = await readJson(packagePath);
      packageJson.name = 'foobar';
      await writeJson(packageJson, packagePath);

      await module.addDefaultName();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('name', 'foobar');
    });
    it('should add the dirname if no name defined', async () => {
      const packagePath = helper.hostPath('package.json');

      await module.addDefaultName();

      const actual = await readJson(packagePath);

      expect(actual).toHaveProperty('name', 'host');
    });
  });
  describe('pinNodeAndYarn', () => {
    beforeEach(async () => {
      await writeJson({}, helper.hostPath('package.json'));
      jest.spyOn(module, '__run').mockReturnValue();
    });
    it('should set a .nvmrc file', async () => {
      await module.pinNodeAndYarn();

      const actual = await read(helper.hostPath('.nvmrc'));

      expect(actual).toEqual(module.nodeVersion);
    });
    it('should run yarn policies', async () => {
      await module.pinNodeAndYarn();

      expect(
        module.__run
      ).toHaveBeenCalledWith(
        `yarn policies set-version ${module.yarnVersion}`,
        { stdout: false }
      );
    });
  });
});
