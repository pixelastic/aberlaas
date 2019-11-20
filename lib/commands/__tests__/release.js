import module from '../release';
import helper from '../../helper';
import firost from 'firost';

describe('release', () => {
  const tmpDirectory = './tmp/release';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    jest.spyOn(helper, 'consoleInfo').mockReturnValue();
    jest.spyOn(helper, 'consoleError').mockReturnValue();
    await firost.emptyDir(helper.hostRoot());
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
  describe('getOptions', () => {
    beforeEach(() => {
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
    });
    it('should call release-it in non-interactive mode', async () => {
      const actual = await module.getOptions();

      expect(actual).toHaveProperty('non-interactive', true);
    });
    it('should accept -n for a dry-run', async () => {
      const actual = await module.getOptions({ n: true });

      expect(actual).toHaveProperty('dry-run', true);
    });
    describe('version', () => {
      it('should use the one passed as argument', async () => {
        const actual = await module.getOptions({ _: ['minor'] });

        expect(actual).toHaveProperty('increment', 'minor');
      });
      it('should ask for version if not passed', async () => {
        jest.spyOn(module, 'askForNextVersion').mockReturnValue('foo');

        const actual = await module.getOptions();

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

      expect(helper.consoleInfo).toHaveBeenCalledWith(
        expect.stringMatching('0.0.0')
      );
    });
    it('should return the result of the prompt', async () => {
      jest.spyOn(firost, 'prompt').mockReturnValue('foo');

      const actual = await module.askForNextVersion();

      expect(actual).toEqual('foo');
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'askForNextVersion').mockImplementation();
      jest.spyOn(module, '__releaseIt').mockImplementation();
      jest.spyOn(module, 'assertCommand').mockImplementation();
      jest.spyOn(firost, 'shell').mockImplementation();
      await firost.writeJson(
        { name: 'foo', version: '0.0.0' },
        helper.hostPath('package.json')
      );
    });
    it('should force fix the npm registry', async () => {
      jest.spyOn(module, 'fixNpmRegistry');

      await module.run();

      expect(module.fixNpmRegistry.mock.calls[0]).toEqual([]);
    });
    it('should call releaseIt', async () => {
      jest.spyOn(module, 'getOptions').mockReturnValue('bar');

      await module.run({ name: 'foo' });

      expect(module.getOptions).toHaveBeenCalledWith({ name: 'foo' });
      expect(module.__releaseIt).toHaveBeenCalledWith('bar');
    });
    it('should return true if release done properly', async () => {
      const actual = await module.run('foo');

      expect(actual).toEqual(true);
    });
    it('should build by default', async () => {
      const input = {};

      await module.run(input);

      expect(module.assertCommand).toHaveBeenCalledWith('build', true);
    });
    it('should disable build with --no-build', async () => {
      const input = { build: false };

      await module.run(input);

      expect(module.assertCommand).toHaveBeenCalledWith('build', false);
    });
    describe('error', () => {
      beforeEach(() => {
        jest.spyOn(process, 'exit').mockReturnValue();
      });
      describe('releaseIt fails', () => {
        beforeEach(async () => {
          jest.spyOn(module, '__releaseIt').mockImplementation(() => {
            throw new Error();
          });
        });
        it('should exit the process with error code 1 if fails', async () => {
          const actual = await module.run('foo');

          expect(actual).toEqual(false);
          expect(process.exit).toHaveBeenCalledWith(1);
        });
        it('should warn user that there is an error', async () => {
          await module.run('foo');

          expect(helper.consoleError).toHaveBeenCalledWith(
            expect.stringContaining('Package not released')
          );
        });
      });
      describe('build fails', () => {
        beforeEach(async () => {
          jest.spyOn(module, 'assertCommand').mockImplementation(() => {
            throw helper.error('ERROR_CODE', 'error message');
          });
        });
        it('should display the returned error', async () => {
          await module.run('foo');

          expect(helper.consoleError).toHaveBeenCalledWith('error message');
        });
      });
    });
  });
  describe('assertCommand', () => {
    beforeEach(() => {
      jest.spyOn(process, 'exit').mockReturnValue();
      jest.spyOn(firost, 'shell').mockReturnValue();
    });
    it('should succeed early if forced disable', async () => {
      const actual = await module.assertCommand('build', false);

      expect(actual).toEqual(true);
      expect(firost.shell).not.toHaveBeenCalled();
    });
    it('should succeed early if no such command', async () => {
      await firost.writeJson({}, helper.hostPath('package.json'));
      const actual = await module.assertCommand('build');

      expect(actual).toEqual(true);
      expect(firost.shell).not.toHaveBeenCalled();
    });
    it('should throw if command failed', async () => {
      await firost.writeJson(
        { scripts: { build: 'foo' } },
        helper.hostPath('package.json')
      );
      jest.spyOn(firost, 'shell').mockImplementation(() => {
        throw new Error();
      });

      let actual = null;
      try {
        await module.assertCommand('build');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_RELEASE_BUILD');
    });
    it('should not stop process if command succeed', async () => {
      await firost.writeJson(
        { scripts: { build: 'foo' } },
        helper.hostPath('package.json')
      );

      await module.assertCommand('build');

      expect(firost.shell).toHaveBeenCalledWith('yarn run build');
      expect(process.exit).not.toHaveBeenCalledWith(1);
    });
  });
});
