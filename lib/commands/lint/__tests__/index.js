const helper = require('../../../helper.js');
const lintCss = require('../css.js');
const lintJson = require('../json.js');
const lintJs = require('../js.js');
const lintYml = require('../yml.js');
const current = require('../index');
const write = require('firost/lib/write');
const emptyDir = require('firost/lib/emptyDir');

describe('lint', () => {
  const tmpDirectory = './tmp/lint/root';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    jest.spyOn(current, '__consoleError').mockReturnValue();
  });
  describe('run', () => {
    it('should run all linters by default', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      jest.spyOn(lintJson, 'run').mockReturnValue();
      jest.spyOn(lintJs, 'run').mockReturnValue();
      jest.spyOn(lintYml, 'run').mockReturnValue();
      const input = {};

      await current.run(input);

      expect(lintCss.run).toHaveBeenCalled();
      expect(lintJson.run).toHaveBeenCalled();
      expect(lintJs.run).toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should run only selected linters if cliArgs passed', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      jest.spyOn(lintJson, 'run').mockReturnValue();
      jest.spyOn(lintJs, 'run').mockReturnValue();
      jest.spyOn(lintYml, 'run').mockReturnValue();
      const input = { js: true, yml: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintJson.run).not.toHaveBeenCalled();
      expect(lintJs.run).toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should allow running only YAML with --yaml', async () => {
      jest.spyOn(lintYml, 'run').mockReturnValue();
      jest.spyOn(lintCss, 'run').mockReturnValue();
      const input = { yaml: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should run fix instead of run if --fix passed', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      jest.spyOn(lintCss, 'fix').mockReturnValue();

      const input = { fix: true, css: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintCss.fix).toHaveBeenCalled();
    });
    it('should return true if all passes', async () => {
      const input = {};

      const actual = await current.run(input);

      expect(actual).toEqual(true);
    });
    it('should throw if error in any linter', async () => {
      jest.spyOn(lintCss, 'run').mockImplementation(() => {
        throw new Error('errorCss');
      });

      const input = {};

      let actual;
      try {
        await current.run(input);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_LINT');
    });
    it('should display all errors of all linters', async () => {
      jest.spyOn(lintCss, 'run').mockImplementation(() => {
        throw new Error('errorCss');
      });
      jest.spyOn(lintJs, 'run').mockImplementation(() => {
        throw new Error('errorJs');
      });
      jest.spyOn(current, '__consoleError').mockReturnValue();

      const input = {};

      try {
        await current.run(input);
      } catch (err) {
        // Swallowing the error
      }

      expect(current.__consoleError).toHaveBeenCalledWith('errorCss');
      expect(current.__consoleError).toHaveBeenCalledWith('errorJs');
    });
    it('should pass list of files to linter', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();

      const input = { _: ['foo.txt'], css: true };

      await current.run(input);

      expect(lintCss.run).toHaveBeenCalledWith(['foo.txt'], undefined);
    });
    it('should allow passing specific config to each linter', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      const input = { css: true, 'config.css': 'foo' };

      await current.run(input);

      expect(lintCss.run).toHaveBeenCalledWith(undefined, 'foo');
    });
  });
  describe('getInputFiles', () => {
    it('should only keep files files in the safelist', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/foo.txt'));
      await write('foo', helper.hostPath('deep/foo.js'));

      const actual = await current.getInputFiles(['.yml', '.js']);

      expect(actual).toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.js'));
    });
    it('should restrict to patterns given', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/foo.yml'));

      const actual = await current.getInputFiles(['.yml'], ['deep/**/*']);

      expect(actual).not.toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.yml'));
    });
  });
});
