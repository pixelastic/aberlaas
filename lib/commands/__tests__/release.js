const module = require('../release');
const helper = require('../../helper');
const mkdirp = require('firost/lib/mkdirp');
const writeJson = require('firost/lib/writeJson');
const emptyDir = require('firost/lib/emptyDir');

describe('release', () => {
  const tmpDirectory = './tmp/release';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    jest.spyOn(module, '__run').mockReturnValue();
    await mkdirp(helper.hostRoot());
    await emptyDir(helper.hostRoot());
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'fixNpmRegistry').mockReturnValue();
      jest.spyOn(module, 'fetchOrigin').mockReturnValue();
      jest.spyOn(module, 'getNpArguments').mockReturnValue();
      jest.spyOn(helper, 'which').mockReturnValue();
    });
    it('should force colored output', async () => {
      await module.run();
      expect(module.__run).toHaveBeenCalledWith(
        expect.stringMatching(/^FORCE_COLOR=1/),
        expect.anything()
      );
    });
    it('should run np', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('np_bin');

      await module.run();
      expect(helper.which).toHaveBeenCalledWith('np');
      expect(module.__run).toHaveBeenCalledWith(
        expect.stringMatching('np_bin'),
        expect.anything()
      );
    });
    it('should add np arguments', async () => {
      jest.spyOn(module, 'getNpArguments').mockReturnValue('--np-arguments');

      await module.run();
      expect(module.__run).toHaveBeenCalledWith(
        expect.stringMatching('--np-arguments'),
        expect.anything()
      );
    });
    it('should allow keyboard input', async () => {
      await module.run();
      expect(module.__run).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ stdin: true })
      );
    });
  });
  describe('getNpArguments', () => {
    beforeEach(async () => {
      jest
        .spyOn(module, 'getHostPackageJson')
        .mockReturnValue({ scripts: { test: 'true' } });
    });
    it('should skip the release draft', async () => {
      const actual = await module.getNpArguments();
      expect(actual).toContain('--no-release-draft');
    });
    it('should pass the patch/minor/major if passed', async () => {
      const cliArgs = { _: 'patch' };
      const actual = await module.getNpArguments(cliArgs);
      expect(actual).toStartWith('patch ');
    });
    it('should disable tests if --no-test is passed', async () => {
      const cliArgs = { test: false };
      const actual = await module.getNpArguments(cliArgs);
      expect(actual).toContain('--no-tests');
    });
    it('should disable tests if no yarn run test defined', async () => {
      jest.spyOn(module, 'getHostPackageJson').mockReturnValue({});

      const actual = await module.getNpArguments();
      expect(actual).toContain('--no-tests');
    });
    it('should accept several inputs', async () => {
      const cliArgs = { _: 'major', test: false };
      const actual = await module.getNpArguments(cliArgs);
      expect(actual).toEqual('major --no-release-draft --no-tests');
    });
    it('should run in preview mode if --dry-run is passed', async () => {
      const cliArgs = { 'dry-run': true };
      const actual = await module.getNpArguments(cliArgs);
      expect(actual).toContain('--preview');
    });
  });
  describe('fixNpmRegistry', () => {
    it('should set the npm registry', () => {
      /* eslint-disable camelcase */
      process.env.npm_config_registry = 'bad value';

      module.fixNpmRegistry();

      expect(process.env.npm_config_registry).toEqual(
        'https://registry.npmjs.org/'
      );
      /* eslint-enable camelcase */
    });
  });
  describe('fetchOrigin', () => {
    it('should run git fetch', async () => {
      await module.fetchOrigin();
      expect(module.__run).toHaveBeenCalledWith(
        'git fetch --all',
        expect.anything()
      );
    });
  });
  describe('getHostPackageJson', () => {
    it('return the content of the host package.json', async () => {
      await writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json')
      );
      const actual = await module.getHostPackageJson();

      expect(actual).toHaveProperty('name', 'foo');
    });
  });
});
