import helper from '../../../helper.js';
import current from '../index.js';
import emptyDir from 'firost/emptyDir.js';

describe('lint', () => {
  const tmpDirectory = './tmp/lint/root';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('run', () => {
    describe('with mocked linters', () => {
      beforeEach(async () => {
        vi.spyOn(current.linters.circleci, 'run').mockReturnValue();
        vi.spyOn(current.linters.css, 'run').mockReturnValue();
        vi.spyOn(current.linters.json, 'run').mockReturnValue();
        vi.spyOn(current.linters.js, 'run').mockReturnValue();
        vi.spyOn(current.linters.yml, 'run').mockReturnValue();
      });
      it('should run all linters by default', async () => {
        const input = {};

        await current.run(input);

        expect(current.linters.circleci.run).toHaveBeenCalled();
        expect(current.linters.css.run).toHaveBeenCalled();
        expect(current.linters.json.run).toHaveBeenCalled();
        expect(current.linters.js.run).toHaveBeenCalled();
        expect(current.linters.yml.run).toHaveBeenCalled();
      });
      it('should run only selected linters if cliArgs passed', async () => {
        const input = { js: true, yml: true };

        await current.run(input);

        expect(current.linters.circleci.run).not.toHaveBeenCalled();
        expect(current.linters.css.run).not.toHaveBeenCalled();
        expect(current.linters.json.run).not.toHaveBeenCalled();
        expect(current.linters.js.run).toHaveBeenCalled();
        expect(current.linters.yml.run).toHaveBeenCalled();
      });
      it('should run fix instead of run if --fix passed', async () => {
        vi.spyOn(current.linters.css, 'fix').mockReturnValue();

        const input = { fix: true, css: true };

        await current.run(input);

        expect(current.linters.css.run).not.toHaveBeenCalled();
        expect(current.linters.css.fix).toHaveBeenCalled();
      });
    });
    it('should return true if all passes', async () => {
      const input = {};

      const actual = await current.run(input);

      expect(actual).toBe(true);
    });
    it('should throw if error in any linter', async () => {
      vi.spyOn(current, '__consoleError').mockReturnValue();
      vi.spyOn(current.linters.css, 'run').mockImplementation(() => {
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
      vi.spyOn(current.linters.css, 'run').mockImplementation(() => {
        throw new Error('errorCss');
      });
      vi.spyOn(current.linters.js, 'run').mockImplementation(() => {
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
      vi.spyOn(current.linters.css, 'run').mockReturnValue();

      const input = { _: ['foo.txt'], css: true };

      await current.run(input);

      expect(current.linters.css.run).toHaveBeenCalledWith(
        ['foo.txt'],
        undefined,
      );
    });
    it('should allow passing specific config to each linter', async () => {
      vi.spyOn(current.linters.css, 'run').mockReturnValue();
      const input = { css: true, 'config.css': 'foo' };

      await current.run(input);

      expect(current.linters.css.run).toHaveBeenCalledWith(undefined, 'foo');
    });
  });
});
