import current from '../index.js';
import helper from '../../../helper.js';
import emptyDir from 'firost/emptyDir.js';
import writeJson from 'firost/writeJson.js';

describe('ci', () => {
  describe('with tmp directory', () => {
    const tmpDirectory = './tmp/ci/index';
    beforeEach(async () => {
      vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);

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
          { scripts: { build: './scripts/build', lint: './scripts/lint' } },
          helper.hostPath('package.json'),
        );
        const actual = await current.availableScripts();
        expect(actual).toContain('build');
        expect(actual).toContain('lint');
      });
    });
  });
  describe('prBranch', () => {
    it('should be empty if not on a PR', async () => {
      vi.spyOn(current, 'isPR').mockReturnValue(false);
      const actual = current.prBranch();
      expect(actual).toBe(false);
    });
    it('should return the CircleCI PR name', async () => {
      vi.spyOn(current, 'isPR').mockReturnValue(true);
      vi.spyOn(current, 'isCircleCI').mockReturnValue(true);
      vi.spyOn(current, 'getEnv').mockReturnValue('foo');
      const actual = current.prBranch();
      expect(actual).toBe('foo');
    });
  });
  describe('scriptsToRun', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'availableScripts').mockReturnValue([
        'test',
        'build:prod',
        'lint',
      ]);
    });
    it('should run test and lint by default', async () => {
      const actual = await current.scriptsToRun();
      expect(actual).toEqual(['test', 'lint', 'build:prod']);
    });
    it('should not run scripts that are not defined in package.json', async () => {
      vi.spyOn(current, 'availableScripts').mockReturnValue(['test']);
      const actual = await current.scriptsToRun();
      expect(actual).toEqual(['test']);
    });
  });
  describe('displayVersion', () => {
    it('should display both node and yarn version', async () => {
      vi.spyOn(current, '__run').mockImplementation(async (command) => {
        if (command === 'node --version') return { stdout: 'foo' };
        if (command === 'yarn --version') return { stdout: 'bar' };
      });
      vi.spyOn(current, '__consoleInfo').mockReturnValue();
      await current.displayVersion();
      expect(current.__consoleInfo).toHaveBeenCalledWith('node foo, yarn vbar');
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'yarnRun').mockReturnValue();
      vi.spyOn(current, 'displayVersion').mockReturnValue();
    });
    describe('locally', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'isCI').mockReturnValue(false);
      });
      it('should do nothing when not on a CI server', async () => {
        await current.run();
        expect(helper.yarnRun).not.toHaveBeenCalled();
      });
    });
    describe('on CI server', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'isCI').mockReturnValue(true);
      });
      it('should display the versions', async () => {
        await current.run();
        expect(current.displayVersion).toHaveBeenCalled();
      });
      it('should run the scripts', async () => {
        vi.spyOn(current, 'scriptsToRun').mockReturnValue(['lint', 'test']);
        let callstack = [];
        vi.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          callstack.push(scriptName);
        });
        await current.run();
        expect(callstack).toEqual(['lint', 'test --maxWorkers=2']);
      });
      it('should pass CPU count to the test methods', async () => {
        vi.spyOn(current, 'scriptsToRun').mockReturnValue(['lint', 'test']);
        let callstack = [];
        vi.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
          callstack.push(scriptName);
        });
        await current.run({ 'cpu-count': 12 });
        expect(callstack).toEqual(['lint', 'test --maxWorkers=12']);
      });
      it('should fail if any step fails', async () => {
        vi.spyOn(current, 'scriptsToRun').mockReturnValue([
          'foo',
          'bar',
          'baz',
        ]);
        vi.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
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
        vi.spyOn(current, 'scriptsToRun').mockReturnValue([
          'foo',
          'bar',
          'baz',
        ]);
        let callstack = [];
        vi.spyOn(helper, 'yarnRun').mockImplementation((scriptName) => {
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
        vi.spyOn(current, 'scriptsToRun').mockReturnValue([
          'foo',
          'bar',
          'baz',
        ]);
        vi.spyOn(helper, 'yarnRun').mockReturnValue();
        const actual = await current.run();
        expect(actual).toBe(true);
      });
      it('should call autoRelease if --auto-release is passed', async () => {
        vi.spyOn(current, 'scriptsToRun').mockReturnValue([]);
        vi.spyOn(helper, 'yarnRun').mockReturnValue();
        vi.spyOn(current, 'autoRelease').mockReturnValue();
        await current.run({ 'auto-release': true });
        expect(current.autoRelease).toHaveBeenCalled();
      });
    });
  });
});
