import module from '../install';
import helper from '../../helper';
import firost from 'firost';

describe('install', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('tmp/host');
    jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('fixtures/aberlaas');
    await firost.emptyDir(helper.hostRoot());
    await firost.copy(
      './fixtures/host/package.json',
      helper.hostPath('package.json')
    );
  });
  describe('copyToHost', () => {
    it('should copy file from aberlaas to host', async () => {
      await module.copyToHost('templates/babel.config.js', 'babel.config.js');

      const actual = await firost.isFile(helper.hostPath('babel.config.js'));

      expect(actual).toEqual(true);
    });
    it('should return true if file copied', async () => {
      const actual = await module.copyToHost(
        'templates/babel.config.js',
        'babel.config.js'
      );

      expect(actual).toEqual(true);
    });
    it('should return false if source does not exist', async () => {
      const actual = await module.copyToHost('nope.js', 'babel.config.js');

      expect(actual).toEqual(false);
    });
    it('should return false if destination already exist', async () => {
      await firost.write('creating file', helper.hostPath('already-there.js'));

      const actual = await module.copyToHost(
        'templates/babel.config.js',
        'already-there.js'
      );

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
  });
  describe('addPackageScript', () => {
    it('should return false if entry in package.json scripts already exist', async () => {
      const actual = await module.addPackageScript('foo', 'scripts/build');

      expect(actual).toEqual(false);
    });
    it('should add an entry to the package.json scripts keys', async () => {
      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.readJson(helper.hostPath('package.json'));

      expect(actual).toHaveProperty('scripts.build', './scripts/build');
    });
    it('should copy script to the host ./scripts directory', async () => {
      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.isFile(helper.hostPath('scripts/build'));

      expect(actual).toEqual(true);
    });
  });
  describe('addScripts', () => {
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
});
