import helper from '../../helper';
import lintCss from '../lint-css';
import lintJson from '../lint-json';
import lintJs from '../lint-js';
import lintYml from '../lint-yml';
import module from '../lint';
import { emptyDir, write } from 'firost';

describe('lint', () => {
  const tmpDirectory = './tmp/lint/root';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    jest.spyOn(helper, 'consoleError').mockReturnValue();
  });
  describe('run', () => {
    it('should run all linters by default', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      jest.spyOn(lintJson, 'run').mockReturnValue();
      jest.spyOn(lintJs, 'run').mockReturnValue();
      jest.spyOn(lintYml, 'run').mockReturnValue();
      const input = {};

      await module.run(input);

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

      await module.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintJson.run).not.toHaveBeenCalled();
      expect(lintJs.run).toHaveBeenCalled();
      expect(lintYml.run).toHaveBeenCalled();
    });
    it('should run fix instead of run if --fix passed', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      jest.spyOn(lintCss, 'fix').mockReturnValue();

      const input = { fix: true, css: true };

      await module.run(input);

      expect(lintCss.run).not.toHaveBeenCalled();
      expect(lintCss.fix).toHaveBeenCalled();
    });
    it('should return true if all passes', async () => {
      const input = {};

      const actual = await module.run(input);

      expect(actual).toEqual(true);
    });
    it('should exit with error code 1 if errors', async () => {
      jest.spyOn(lintCss, 'run').mockImplementation(() => {
        throw new Error('foobar');
      });
      jest.spyOn(process, 'exit').mockReturnValue();

      const input = {};

      await module.run(input);

      expect(process.exit).toHaveBeenCalledWith(1);
    });
    it('should display all errors of all linters', async () => {
      jest.spyOn(lintCss, 'run').mockImplementation(() => {
        const error = new Error('errorCss');
        error.message = 'foo';
        throw error;
      });
      jest.spyOn(lintJs, 'run').mockImplementation(() => {
        const error = new Error('errorJs');
        error.message = 'bar';
        throw error;
      });
      jest.spyOn(process, 'exit').mockReturnValue();
      jest.spyOn(helper, 'consoleError').mockReturnValue();

      const input = {};

      await module.run(input);

      expect(helper.consoleError).toHaveBeenCalledWith('foo');
      expect(helper.consoleError).toHaveBeenCalledWith('bar');
    });
    it('should pass list of files to linter', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();

      const input = { _: ['foo.txt'], css: true };

      await module.run(input);

      expect(lintCss.run).toHaveBeenCalledWith(['foo.txt'], undefined);
    });
    it('should allow passing specific config to each linter', async () => {
      jest.spyOn(lintCss, 'run').mockReturnValue();
      const input = { css: true, 'config.css': 'foo' };

      await module.run(input);

      expect(lintCss.run).toHaveBeenCalledWith(undefined, 'foo');
    });
  });
  describe('getInputFiles', () => {
    it('should only keep files files in the safelist', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/foo.txt'));
      await write('foo', helper.hostPath('deep/foo.js'));

      const actual = await module.getInputFiles(['.yml', '.js']);

      expect(actual).toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.js'));
    });
    it('should restrict to patterns given', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/foo.yml'));

      const actual = await module.getInputFiles(['.yml'], ['deep/**/*']);

      expect(actual).not.toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.yml'));
    });
  });
});
