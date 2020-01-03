import module from '../release';
import helper from '../../helper';
import firost from 'firost';
import path from 'path';

describe('release', () => {
  const tmpDirectory = './tmp/release';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(path.resolve(tmpDirectory));
    jest.spyOn(firost, 'consoleInfo').mockReturnValue();
    jest.spyOn(firost, 'consoleError').mockReturnValue();
    jest.spyOn(firost, 'run').mockReturnValue();
    await firost.emptyDir(helper.hostRoot());
  });
  describe('gitPull', () => {
    it('should run git pull', async () => {
      await module.gitPull();
      expect(firost.run).toHaveBeenCalledWith('git pull');
    });
  });
  describe('runBuild', () => {
    it('should run yarn run build', async () => {
      await module.runBuild();
      expect(firost.run).toHaveBeenCalledWith('yarn run build');
    });
  });
  describe('runTest', () => {
    it('should run yarn run test', async () => {
      await module.runTest();
      expect(firost.run).toHaveBeenCalledWith('yarn run test');
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
  describe('getReleaseItOptions', () => {
    beforeEach(() => {
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
    });
    it('should call release-it in non-interactive mode', async () => {
      const actual = await module.getReleaseItOptions();

      expect(actual).toHaveProperty('non-interactive', true);
    });
    it('should accept -n for a dry-run', async () => {
      const actual = await module.getReleaseItOptions({ n: true });

      expect(actual).toHaveProperty('dry-run', true);
    });
    describe('version', () => {
      it('should use the one passed as argument', async () => {
        const actual = await module.getReleaseItOptions({
          nextVersion: 'minor',
        });

        expect(actual).toHaveProperty('increment', 'minor');
      });
      it('should ask for version if not passed', async () => {
        jest.spyOn(module, 'askForNextVersion').mockReturnValue('foo');

        const actual = await module.getReleaseItOptions();

        expect(actual).toHaveProperty('increment', 'foo');
      });
    });
  });
  describe('askForNextVersion', () => {
    beforeEach(async () => {
      jest.spyOn(firost, 'prompt').mockReturnValue();
      await firost.writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json')
      );
    });
    it('should display the current version', async () => {
      await module.askForNextVersion();

      expect(firost.consoleInfo).toHaveBeenCalledWith(
        expect.stringMatching('0.0.0')
      );
    });
    it('should return the result of the prompt', async () => {
      jest.spyOn(firost, 'prompt').mockReturnValue('foo');

      const actual = await module.askForNextVersion();

      expect(actual).toEqual('foo');
    });
  });
  describe('getHostPackageJson', () => {
    it('return the content of the host package.json', async () => {
      await firost.writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json')
      );
      const actual = await module.getHostPackageJson();

      expect(actual).toHaveProperty('name', 'foo');
    });
  });
  describe('release', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'fixNpmRegistry').mockImplementation();
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
      jest.spyOn(module, '__releaseIt').mockImplementation();
      await firost.writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json')
      );
    });
    it('should fix the npm registry', async () => {
      await module.release();

      expect(module.fixNpmRegistry).toHaveBeenCalled();
    });
    it('should call releaseIt', async () => {
      await module.release();

      expect(module.__releaseIt).toHaveBeenCalled();
    });
    it('should display the new version', async () => {
      jest.spyOn(module, '__releaseIt').mockReturnValue({ version: '1.0.0' });
      await module.release();

      expect(firost.consoleInfo).toHaveBeenCalledWith(
        expect.stringMatching(/.*foo.* 1.0.0 released$/)
      );
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'gitPull').mockImplementation();
      jest.spyOn(module, 'runBuild').mockImplementation();
      jest.spyOn(module, 'runTest').mockImplementation();
      jest.spyOn(module, 'release').mockImplementation();
      jest.spyOn(firost, 'consoleSuccess').mockImplementation();
    });
    it('should pull, build, test and release', async () => {
      await module.run();

      expect(module.gitPull).toHaveBeenCalledBefore(module.runBuild);
      expect(module.runBuild).toHaveBeenCalledBefore(module.runTest);
      expect(module.runTest).toHaveBeenCalledBefore(module.release);
    });
    it('should skip pull if pull: false', async () => {
      await module.run({ pull: false });

      expect(module.gitPull).not.toHaveBeenCalled();
    });
    it('should skip build if build: false', async () => {
      await module.run({ build: false });

      expect(module.runBuild).not.toHaveBeenCalled();
    });
    it('should skip test if test: false', async () => {
      await module.run({ test: false });

      expect(module.runTest).not.toHaveBeenCalled();
    });
    it('should dry-run release if n: true', async () => {
      await module.run({ n: true });

      expect(module.release).toHaveBeenCalledWith({ n: true });
    });
    it('should allow specifying the new version', async () => {
      await module.run({ _: ['minor'] });

      expect(module.release).toHaveBeenCalledWith(
        expect.objectContaining({ nextVersion: 'minor' })
      );
    });
    it('should fail if any step fails', async () => {
      jest.spyOn(module, 'runTest').mockImplementation(() => {
        throw new Error();
      });

      let actual;
      try {
        await module.run();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_RELEASE');
    });
  });
});
