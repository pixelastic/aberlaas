const module = require('../ci');
const helper = require('../../helper');
const emptyDir = require('firost/lib/emptyDir');
const writeJson = require('firost/lib/writeJson');

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
  describe('scriptsToRun', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'availableScripts').mockReturnValue(['test', 'lint']);
    });
    it('should run test and lint by default', async () => {
      const actual = await module.scriptsToRun();
      expect(actual).toEqual(['test', 'lint']);
    });
    it('should not run scripts that are not defined in package.json', async () => {
      jest.spyOn(module, 'availableScripts').mockReturnValue(['test']);
      const actual = await module.scriptsToRun();
      expect(actual).toEqual(['test']);
    });
  });
  describe('displayVersion', () => {
    it('should display both node and yarn version', async () => {
      jest.spyOn(module, '__run').mockImplementation(async command => {
        if (command === 'node --version') return { stdout: 'foo' };
        if (command === 'yarn --version') return { stdout: 'bar' };
      });
      jest.spyOn(module, '__consoleInfo').mockReturnValue();
      await module.displayVersion();
      expect(module.__consoleInfo).toHaveBeenCalledWith('node foo, yarn vbar');
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'yarnRun').mockReturnValue();
      jest.spyOn(module, 'displayVersion').mockReturnValue();
    });
    describe('locally', () => {
      beforeEach(async () => {
        jest.spyOn(module, 'isCI').mockReturnValue(false);
      });
      it('should do nothing when not on a CI server', async () => {
        await module.run();
        expect(helper.yarnRun).not.toHaveBeenCalled();
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
        jest.spyOn(helper, 'yarnRun').mockImplementation(scriptName => {
          callstack.push(scriptName);
        });
        await module.run();
        expect(callstack).toEqual(['foo', 'bar']);
      });
      it('should fail if any step fails', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(helper, 'yarnRun').mockImplementation(scriptName => {
          if (scriptName === 'bar') {
            throw new Error('foo');
          }
        });
        let actual;
        try {
          await module.run();
        } catch (err) {
          actual = err;
        }
        expect(actual).toHaveProperty('message', 'foo');
      });
      it('should not call further steps if one fails', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        let callstack = [];
        jest.spyOn(helper, 'yarnRun').mockImplementation(scriptName => {
          if (scriptName === 'bar') {
            throw new Error();
          }
          callstack.push(scriptName);
        });
        try {
          await module.run();
        } catch (err) {
          // Swallowing the error
        }
        expect(callstack).toEqual(['foo']);
      });
      it('should succeed if all steps succed', async () => {
        jest
          .spyOn(module, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(helper, 'yarnRun').mockReturnValue();
        const actual = await module.run();
        expect(actual).toEqual(true);
      });
    });
  });
});
