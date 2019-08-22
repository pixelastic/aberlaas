import module from '../init';
import helper from '../../helper';
import firost from 'firost';

describe('init', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/host');

    await firost.emptyDir(helper.hostRoot());
  });
  describe('copyToHost', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./tmp/aberlaas');
      await firost.emptyDir(helper.aberlaasRoot());
    });
    it('should copy file from aberlaas to host', async () => {
      await firost.write('foo', helper.aberlaasPath('foo.js'));

      await module.copyToHost('foo.js', 'bar.js');

      const actual = await firost.read(helper.hostPath('bar.js'));
      expect(actual).toEqual('foo');
    });
    it('should return true if file copied', async () => {
      await firost.write('foo', helper.aberlaasPath('foo.js'));

      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(true);
    });
    it('should return false if source does not exist', async () => {
      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(false);
    });
    it('should return false if destination already exist', async () => {
      await firost.write('foo', helper.aberlaasPath('foo.js'));
      await firost.write('bar', helper.hostPath('bar.js'));

      const actual = await module.copyToHost('foo.js', 'bar.js');

      expect(actual).toEqual(false);
    });
  });
  describe('addConfigFiles', () => {
    it('should add babel config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('babel.config.js'));

      expect(actual).toEqual(true);
    });
    it('should add eslint config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('.eslintrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add eslint ignore file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('.eslintignore'));

      expect(actual).toEqual(true);
    });
    it('should add jest config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('jest.config.js'));

      expect(actual).toEqual(true);
    });
    it('should add husky config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('.huskyrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add stylelint config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('.stylelintrc.js'));

      expect(actual).toEqual(true);
    });
    it('should add prettier config file', async () => {
      await module.addConfigFiles();

      const actual = await firost.isFile(helper.hostPath('.prettierrc.js'));

      expect(actual).toEqual(true);
    });
  });
  describe('addPackageScript', () => {
    it('should return false if entry in package.json scripts already exist', async () => {
      await firost.writeJson(
        { scripts: { foo: 'bar' } },
        helper.hostPath('package.json')
      );

      const actual = await module.addPackageScript('foo', 'scripts/build');

      expect(actual).toEqual(false);
    });
    it('should add an entry to the package.json scripts keys', async () => {
      await firost.writeJson({}, helper.hostPath('package.json'));

      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.readJson(helper.hostPath('package.json'));

      expect(actual).toHaveProperty('scripts.build', './scripts/build');
    });
    it('should copy script to the host ./scripts directory', async () => {
      await firost.writeJson({}, helper.hostPath('package.json'));

      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.isFile(helper.hostPath('scripts/build'));

      expect(actual).toEqual(true);
    });
  });
  describe('addScripts', () => {
    beforeEach(async () => {
      await firost.writeJson({}, helper.hostPath('package.json'));
    });
    it('should add build script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(helper.hostPath('scripts/build'));

      expect(packageJson).toHaveProperty('scripts.build', './scripts/build');
      expect(fileCreated).toEqual(true);
    });
    it('should add build:watch script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(
        helper.hostPath('scripts/build-watch')
      );

      expect(packageJson).toHaveProperty(
        'scripts.build:watch',
        './scripts/build-watch'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add lint script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(helper.hostPath('scripts/lint'));

      expect(packageJson).toHaveProperty('scripts.lint', './scripts/lint');
      expect(fileCreated).toEqual(true);
    });
    it('should add lint:fix script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(
        helper.hostPath('scripts/lint-fix')
      );

      expect(packageJson).toHaveProperty(
        'scripts.lint:fix',
        './scripts/lint-fix'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add release script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(
        helper.hostPath('scripts/release')
      );

      expect(packageJson).toHaveProperty(
        'scripts.release',
        './scripts/release'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add test script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(helper.hostPath('scripts/test'));

      expect(packageJson).toHaveProperty('scripts.test', './scripts/test');
      expect(fileCreated).toEqual(true);
    });
    it('should add test:watch script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        helper.hostPath('package.json')
      );
      const fileCreated = await firost.isFile(
        helper.hostPath('scripts/test-watch')
      );

      expect(packageJson).toHaveProperty(
        'scripts.test:watch',
        './scripts/test-watch'
      );
      expect(fileCreated).toEqual(true);
    });
  });
  describe('addScaffolding', () => {
    it('should add ./lib/index.js', async () => {
      await module.addScaffolding();

      const actual = await firost.isFile(helper.hostPath('./lib/index.js'));

      expect(actual).toEqual(true);
    });
    it('should add ./lib/__tests__/index.js', async () => {
      await module.addScaffolding();

      const actual = await firost.isFile(
        helper.hostPath('./lib/__tests__/index.js')
      );

      expect(actual).toEqual(true);
    });
    it('should not change files that already exist', async () => {
      await firost.write('foo', helper.hostPath('./lib/index.js'));
      await module.addScaffolding();

      const actual = await firost.read(helper.hostPath('./lib/index.js'));

      expect(actual).toEqual('foo');
    });
  });
  describe('setDefaultReleaseFiles', () => {
    beforeEach(async () => {
      await firost.writeJson({}, helper.hostPath('package.json'));
    });
    it('should set .main key to build/index.js', async () => {
      await module.setDefaultReleaseFiles();

      const actual = await firost.readJson(helper.hostPath('package.json'));

      expect(actual.main).toEqual('build/index.js');
    });
    it('should set .files key to ["build/"]', async () => {
      await module.setDefaultReleaseFiles();

      const actual = await firost.readJson(helper.hostPath('package.json'));

      expect(actual.files).toContain('build/');
    });
  });
});