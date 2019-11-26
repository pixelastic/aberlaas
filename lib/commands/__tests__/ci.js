import module from '../ci';
import helper from '../../helper';
import { writeJson, emptyDir } from 'firost';

describe('ci', () => {
  describe('with tmp directory', () => {
    const tmpDirectory = './tmp/ci';
    beforeEach(async () => {
      jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
      await emptyDir(tmpDirectory);
    });
    describe('availableScripts', () => {
      it('should return an empty array if no scripts', async () => {
        await writeJson({}, helper.hostPath('package.json'));

        const actual = await module.availableScripts();

        expect(actual).toEqual([]);
      });
      it('should return an array of all script keys', async () => {
        await writeJson(
          { scripts: { foo: 'bar', baz: 'quux' } },
          helper.hostPath('package.json')
        );

        const actual = await module.availableScripts();

        expect(actual).toInclude('foo');
        expect(actual).toInclude('baz');
      });
    });
    describe('runScript', () => {
      it('should display script stdout to stdout', async () => {
        await writeJson(
          { license: 'MIT', scripts: { build: 'echo "foo"' } },
          helper.hostPath('package.json')
        );

        const actual = await captureOutput(async () => {
          await module.runScript('build');
        });

        expect(actual.stdout).toInclude('foo');
      });
      it('should display script stderr to stdout', async () => {
        await writeJson(
          { license: 'MIT', scripts: { build: '>&2 echo "foo"' } },
          helper.hostPath('package.json')
        );

        const actual = await captureOutput(async () => {
          await module.runScript('build');
        });

        expect(actual.stdout).toInclude('foo');
      });
      it('should throw an error if the script fails', async () => {
        await writeJson(
          { license: 'MIT', scripts: { build: 'false' } },
          helper.hostPath('package.json')
        );

        let actual;
        try {
          await captureOutput(async () => {
            await module.runScript('build');
          });
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty('exitCode', 1);
      });
    });
  });
  describe('prBranch', () => {
    it('should be empty if not on a PR', async () => {
      jest.spyOn(module, 'isPR').mockReturnValue(false);

      const actual = module.prBranch();

      expect(actual).toEqual(false);
    });
    it('should return the CircleCI PR name', async () => {
      jest.spyOn(module, 'isPR').mockReturnValue(true);
      jest.spyOn(module, 'isCircleCI').mockReturnValue(true);
      jest.spyOn(module, 'getEnv').mockReturnValue('foo');

      const actual = module.prBranch();

      expect(actual).toEqual('foo');
    });
  });
  describe('success', () => {
    it('should exit with error code 0', async () => {
      jest.spyOn(process, 'exit').mockReturnValue();
      module.success();

      expect(process.exit).toHaveBeenCalledWith(0);
    });
  });
  describe('failure', () => {
    it('should exit with error code 1', async () => {
      jest.spyOn(process, 'exit').mockReturnValue();
      module.failure();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
  describe('scriptsToRun', () => {
    beforeEach(async () => {
      jest
        .spyOn(module, 'availableScripts')
        .mockReturnValue(['test', 'lint', 'build']);
    });
    it('should run build, test and lint by default', async () => {
      const actual = await module.scriptsToRun();

      expect(actual).toEqual(['build', 'test', 'lint']);
    });
    it('should not run scripts that are not defined in package.json', async () => {
      jest.spyOn(module, 'availableScripts').mockReturnValue(['test']);

      const actual = await module.scriptsToRun();

      expect(actual).toEqual(['test']);
    });
  });
  describe('displayVersion', () => {
    it('should display both node and yarn version', async () => {
      jest.spyOn(module, '__execa').mockImplementation(async bin => {
        if (bin === 'node') return { stdout: 'foo' };
        if (bin === 'yarn') return { stdout: 'bar' };
      });
      jest.spyOn(helper, 'consoleInfo').mockReturnValue();

      await module.displayVersion();

      expect(helper.consoleInfo).toHaveBeenCalledWith('node foo, yarn vbar');
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'runScript').mockReturnValue();
      jest.spyOn(module, 'failure').mockReturnValue();
      jest.spyOn(module, 'success').mockReturnValue();
      jest.spyOn(module, 'displayVersion').mockReturnValue();
    });
    describe('locally', () => {
      beforeEach(async () => {
        jest.spyOn(module, 'isCI').mockReturnValue(false);
      });
      it('should do nothing when not on a CI server', async () => {
        await module.run();

        expect(module.runScript).not.toHaveBeenCalled();
      });
    });
    describe('on CI server', () => {
      beforeEach(async () => {
        jest.spyOn(module, 'isCI').mockReturnValue(true);
      });
      it('should display the versions', async () => {
        await module.run();

        expect(module.displayVersion).toHaveBeenCalled();
      });
      it('should run the scripts', async () => {
        jest.spyOn(module, 'scriptsToRun').mockReturnValue(['foo', 'bar']);
        let callstack = [];
        jest.spyOn(module, 'runScript').mockImplementation(scriptName => {
          callstack.push(scriptName);
        });

        await module.run();

        expect(callstack).toEqual(['foo', 'bar']);
      });
      it('should fail if any step fails', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(module, 'runScript').mockImplementation(scriptName => {
          if (scriptName === 'bar') {
            throw new Error();
          }
        });

        await module.run();

        expect(module.failure).toHaveBeenCalled();
      });
      it('should not call further steps if one fails', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        let callstack = [];
        jest.spyOn(module, 'runScript').mockImplementation(scriptName => {
          if (scriptName === 'bar') {
            throw new Error();
          }
          callstack.push(scriptName);
        });

        await module.run();

        expect(callstack).toEqual(['foo']);
      });
      it('should succeed if all steps succed', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(module, 'runScript').mockReturnValue();

        await module.run();

        expect(module.success).toHaveBeenCalled();
      });
    });
  });
});
