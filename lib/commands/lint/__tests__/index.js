import helper from '../../../helper.js';
import lintCss from '../css.js';
import lintJson from '../json.js';
import lintJs from '../js.js';
import lintYml from '../yml.js';
import current from '../index.js';
import write from 'firost/write.js';
import emptyDir from 'firost/emptyDir.js';

describe('lint', () => {
  const tmpDirectory = './tmp/lint/root';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    vi.spyOn(current, '__consoleError').mockReturnValue();
  });
  describe('run', () => {
    it('should run all linters by default', async () => {
      vi.spyOn(lintCss, 'run').mockReturnValue();
      vi.spyOn(lintJson, 'run').mockReturnValue();
      vi.spyOn(lintJs, 'run').mockReturnValue();
      vi.spyOn(lintYml, 'run').mockReturnValue();
      const input = {};

      await current.run(input);

      expect(lintCss.run).toHaveBeenCalled();
      expect(lintJson.run).toHaveBeenCalled();
      expect(lintJs.run).toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should run only selected linters if cliArgs passed', async () => {
      vi.spyOn(lintCss, 'run').mockReturnValue();
      vi.spyOn(lintJson, 'run').mockReturnValue();
      vi.spyOn(lintJs, 'run').mockReturnValue();
      vi.spyOn(lintYml, 'run').mockReturnValue();
      const input = { js: true, yml: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintJson.run).not.toHaveBeenCalled();
      expect(lintJs.run).toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should allow running only YAML with --yaml', async () => {
      vi.spyOn(lintYml, 'run').mockReturnValue();
      vi.spyOn(lintCss, 'run').mockReturnValue();
      const input = { yaml: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should run fix instead of run if --fix passed', async () => {
      vi.spyOn(lintCss, 'run').mockReturnValue();
      vi.spyOn(lintCss, 'fix').mockReturnValue();

      const input = { fix: true, css: true };

      await current.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintCss.fix).toHaveBeenCalled();
    });
    it('should return true if all passes', async () => {
      const input = {};

      const actual = await current.run(input);

      expect(actual).toBe(true);
    });
    it('should throw if error in any linter', async () => {
      vi.spyOn(lintCss, 'run').mockImplementation(() => {
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
      vi.spyOn(lintCss, 'run').mockImplementation(() => {
        throw new Error('errorCss');
      });
      vi.spyOn(lintJs, 'run').mockImplementation(() => {
        throw new Error('errorJs');
      });
      vi.spyOn(current, '__consoleError').mockReturnValue();

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
      vi.spyOn(lintCss, 'run').mockReturnValue();

      const input = { _: ['foo.txt'], css: true };

      await current.run(input);

      expect(lintCss.run).toHaveBeenCalledWith(['foo.txt'], undefined);
    });
    it('should allow passing specific config to each linter', async () => {
      vi.spyOn(lintCss, 'run').mockReturnValue();
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
