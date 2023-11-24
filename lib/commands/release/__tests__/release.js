import current from '../index.js';
import helper from '../../../helper.js';
import mkdirp from 'firost/mkdirp.js';
import writeJson from 'firost/writeJson.js';
import emptyDir from 'firost/emptyDir.js';

describe('release', () => {
  const tmpDirectory = './tmp/release';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    vi.spyOn(current, '__run').mockReturnValue();
    await mkdirp(helper.hostRoot());
    await emptyDir(helper.hostRoot());
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'fixNpmRegistry').mockReturnValue();
      vi.spyOn(current, 'fetchOrigin').mockReturnValue();
      vi.spyOn(current, 'getNpArguments').mockReturnValue();
      vi.spyOn(helper, 'which').mockReturnValue();
    });
    it('should force colored output', async () => {
      await current.run();
      expect(current.__run).toHaveBeenCalledWith(
        expect.stringMatching(/^FORCE_COLOR=1/),
        expect.anything(),
      );
    });
    it('should run np', async () => {
      vi.spyOn(helper, 'which').mockReturnValue('np_bin');

      await current.run();
      expect(helper.which).toHaveBeenCalledWith('np');
      expect(current.__run).toHaveBeenCalledWith(
        expect.stringMatching('np_bin'),
        expect.anything(),
      );
    });
    it('should add np arguments', async () => {
      vi.spyOn(current, 'getNpArguments').mockReturnValue('--np-arguments');

      await current.run();
      expect(current.__run).toHaveBeenCalledWith(
        expect.stringMatching('--np-arguments'),
        expect.anything(),
      );
    });
    it('should allow keyboard input', async () => {
      await current.run();
      expect(current.__run).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ stdin: true }),
      );
    });
  });
  describe('getNpArguments', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'getHostPackageJson').mockReturnValue({
        scripts: { test: 'true' },
      });
    });
    it('should skip the release draft', async () => {
      const actual = await current.getNpArguments();
      expect(actual).toContain('--no-release-draft');
    });
    it('should not enable 2FA', async () => {
      const actual = await current.getNpArguments();
      expect(actual).toContain('--no-2fa');
    });
    it('should allow releasing from branches other than master', async () => {
      const actual = await current.getNpArguments();
      expect(actual).toContain('--any-branch');
    });
    it('should pass the patch/minor/major if passed', async () => {
      const cliArgs = { _: 'patch' };
      const actual = await current.getNpArguments(cliArgs);
      expect(actual).toStartWith('patch ');
    });
    it('should disable tests if --no-test is passed', async () => {
      const cliArgs = { test: false };
      const actual = await current.getNpArguments(cliArgs);
      expect(actual).toContain('--no-tests');
    });
    it('should disable tests if no yarn run test defined', async () => {
      vi.spyOn(current, 'getHostPackageJson').mockReturnValue({});

      const actual = await current.getNpArguments();
      expect(actual).toContain('--no-tests');
    });
    it('should accept several inputs', async () => {
      const cliArgs = { _: 'major', test: false };
      const actual = await current.getNpArguments(cliArgs);
      expect(actual).toBe(
        'major --no-release-draft --no-2fa --any-branch --no-tests',
      );
    });
    it('should run in preview mode if --dry-run is passed', async () => {
      const cliArgs = { 'dry-run': true };
      const actual = await current.getNpArguments(cliArgs);
      expect(actual).toContain('--preview');
    });
  });
  describe('fixNpmRegistry', () => {
    it('should set the npm registry', () => {
      /* eslint-disable camelcase */
      process.env.npm_config_registry = 'bad value';

      current.fixNpmRegistry();

      expect(process.env.npm_config_registry).toBe(
        'https://registry.npmjs.org/',
      );
      /* eslint-enable camelcase */
    });
  });
  describe('fetchOrigin', () => {
    it('should run git fetch', async () => {
      await current.fetchOrigin();
      expect(current.__run).toHaveBeenCalledWith(
        'git fetch --all',
        expect.anything(),
      );
    });
  });
  describe('getHostPackageJson', () => {
    it('return the content of the host package.json', async () => {
      await writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json'),
      );
      const actual = await current.getHostPackageJson();

      expect(actual).toHaveProperty('name', 'foo');
    });
  });
});
