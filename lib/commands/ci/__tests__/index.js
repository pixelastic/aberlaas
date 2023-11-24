const current = require('../index.js');
const helper = require('../../../helper.js');
const emptyDir = require('firost/emptyDir');
const writeJson = require('firost/writeJson');

describe('ci', () => {
  describe('with tmp directory', () => {
    const tmpDirectory = './tmp/ci/index';
    beforeEach(async () => {
      jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);

      await emptyDir(tmpDirectory);
    });
    describe('availableScripts', () => {
      it('should return an empty array if no scripts', async () => {
        await writeJson({}, helper.hostPath('package.json'));
        const actual = await current.availableScripts();
        expect(actual).toEqual([]);
      });
      it('should return an array of all script keys', async () => {
        await writeJson(
          { scripts: { foo: 'bar', baz: 'quux' } },
          helper.hostPath('package.json'),
        );
        const actual = await current.availableScripts();
        expect(actual).toInclude('foo');
        expect(actual).toInclude('baz');
      });
    });
  });
  describe('prBranch', () => {
    it('should be empty if not on a PR', async () => {
      jest.spyOn(current, 'isPR').mockReturnValue(false);
      const actual = current.prBranch();
      expect(actual).toEqual(false);
    });
    it('should return the CircleCI PR name', async () => {
      jest.spyOn(current, 'isPR').mockReturnValue(true);
      jest.spyOn(current, 'isCircleCI').mockReturnValue(true);
      jest.spyOn(current, 'getEnv').mockReturnValue('foo');
      const actual = current.prBranch();
      expect(actual).toEqual('foo');
    });
  });
  describe('scriptsToRun', () => {
    beforeEach(async () => {
      jest
        .spyOn(current, 'availableScripts')
        .mockReturnValue(['test', 'build:prod', 'lint']);
    });
    it('should run test and lint by default', async () => {
      const actual = await current.scriptsToRun();
      expect(actual).toEqual(['test', 'lint', 'build:prod']);
    });
    it('should not run scripts that are not defined in package.json', async () => {
      jest.spyOn(current, 'availableScripts').mockReturnValue(['test']);
      const actual = await current.scriptsToRun();
      expect(actual).toEqual(['test']);
    });
  });
  describe('displayVersion', () => {
    it('should display both node and yarn version', async () => {
      jest.spyOn(current, '__run').mockImplementation(async (command) => {
        if (command === 'node --version') return { stdout: 'foo' };
        if (command === 'yarn --version') return { stdout: 'bar' };
      });
      jest.spyOn(current, '__consoleInfo').mockReturnValue();
      await current.displayVersion();
      expect(current.__consoleInfo).toHaveBeenCalledWith('node foo, yarn vbar');
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'yarnRun').mockReturnValue();
      jest.spyOn(current, 'displayVersion').mockReturnValue();
    });
    describe('locally', () => {
      beforeEach(async () => {
        jest.spyOn(current, 'isCI').mockReturnValue(false);
      });
      it('should do nothing when not on a CI server', async () => {
        await current.run();
        expect(helper.yarnRun).not.toHaveBeenCalled();
      });
    });
    describe('on CI server', () => {
      beforeEach(async () => {
        jest.spyOn(current, 'isCI').mockReturnValue(true);
      });
      it('should display the versions', async () => {
        await current.run();
        expect(current.displayVersion).toHaveBeenCalled();
      });
      it('should run the scripts', async () => {
        jest.spyOn(current, 'scriptsToRun').mockReturnValue(['lint', 'test']);
        let callstack = [];
        jest.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          callstack.push(scriptName);
        });
        await current.run();
        expect(callstack).toEqual(['lint', 'test --maxWorkers=2']);
      });
      it('should pass CPU count to the test methods', async () => {
        jest.spyOn(current, 'scriptsToRun').mockReturnValue(['lint', 'test']);
        let callstack = [];
        jest.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          callstack.push(scriptName);
        });
        await current.run({ 'cpu-count': 12 });
        expect(callstack).toEqual(['lint', 'test --maxWorkers=12']);
      });
      it('should fail if any step fails', async () => {
        jest
          .spyOn(current, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          if (scriptName === 'bar') {
            throw new Error('foo');
          }
        });
        let actual;
        try {
          await current.run();
        } catch (err) {
          actual = err;
        }
        expect(actual).toHaveProperty('message', 'foo');
      });
      it('should not call further steps if one fails', async () => {
        jest
          .spyOn(current, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        let callstack = [];
        jest.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          if (scriptName === 'bar') {
            throw new Error();
          }
          callstack.push(scriptName);
        });
        try {
          await current.run();
        } catch (err) {
          // Swallowing the error
        }
        expect(callstack).toEqual(['foo']);
      });
      it('should succeed if all steps succeed', async () => {
        jest
          .spyOn(current, 'scriptsToRun')
          .mockReturnValue(['foo', 'bar', 'baz']);
        jest.spyOn(helper, 'yarnRun').mockReturnValue();
        const actual = await current.run();
        expect(actual).toEqual(true);
      });
      it('should call autoRelease if --auto-release is passed', async () => {
        jest.spyOn(current, 'scriptsToRun').mockReturnValue([]);
        jest.spyOn(helper, 'yarnRun').mockReturnValue();
        jest.spyOn(current, 'autoRelease').mockImplementation();
        await current.run({ 'auto-release': true });
        expect(current.autoRelease).toHaveBeenCalled();
      });
    });
  });
});
