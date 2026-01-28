import { absolute, emptyDir } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { __, run } from '../main.js';

describe('lint', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/root');
  beforeEach(async () => {
    await emptyDir(tmpDirectory);
    vi.spyOn(__, 'consoleError').mockReturnValue();

    // We mock them all so a bug doesn't just wipe our real aberlaas repo
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${tmpDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${tmpDirectory}/lib/src`,
    );
  });
  describe('run', () => {
    const mockedLinters = {
      circleci: { run: vi.fn(), fix: vi.fn() },
      css: { run: vi.fn(), fix: vi.fn() },
      json: { run: vi.fn(), fix: vi.fn() },
      js: { run: vi.fn(), fix: vi.fn() },
      yml: { run: vi.fn(), fix: vi.fn() },
    };
    beforeEach(async () => {
      vi.spyOn(__, 'getLinter').mockImplementation((linterName) => {
        return mockedLinters[linterName];
      });
    });

    it('should run all linters by default', async () => {
      const input = {};

      await run(input);

      expect(mockedLinters.circleci.run).toHaveBeenCalled();
      expect(mockedLinters.css.run).toHaveBeenCalled();
      expect(mockedLinters.json.run).toHaveBeenCalled();
      expect(mockedLinters.js.run).toHaveBeenCalled();
      expect(mockedLinters.yml.run).toHaveBeenCalled();
    });
    it('should run only selected linters if cliArgs passed', async () => {
      const input = { js: true, yml: true };

      await run(input);

      expect(mockedLinters.circleci.run).not.toHaveBeenCalled();
      expect(mockedLinters.css.run).not.toHaveBeenCalled();
      expect(mockedLinters.json.run).not.toHaveBeenCalled();
      expect(mockedLinters.js.run).toHaveBeenCalled();
      expect(mockedLinters.yml.run).toHaveBeenCalled();
    });
    it('should run fix instead of run if --fix passed', async () => {
      const input = { fix: true, css: true };

      await run(input);

      expect(mockedLinters.css.run).not.toHaveBeenCalled();
      expect(mockedLinters.css.fix).toHaveBeenCalled();
    });
    it('should return true if all passes', async () => {
      const input = {};

      const actual = await run(input);

      expect(actual).toBe(true);
    });
    it('should return false if at least one fails', async () => {
      mockedLinters.yml.run.mockImplementation(() => {
        throw new Error();
      });
      const input = {};

      let actual = null;
      try {
        await run(input);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_FAIL');
    });
    it('should display all errors of all failed linters', async () => {
      mockedLinters.yml.run.mockImplementation(() => {
        throw new Error('ymlError');
      });
      mockedLinters.js.run.mockImplementation(() => {
        throw new Error('jsError');
      });

      const input = {};

      try {
        await run(input);
      } catch (_err) {
        // Swallowing the error
      }

      expect(__.consoleError).toHaveBeenCalledWith('ymlError');
      expect(__.consoleError).toHaveBeenCalledWith('jsError');
    });
    it('should pass list of files to all linters and config to each linter', async () => {
      const input = {
        _: ['foo.css'],
        config: { css: 'lintercss.config.js', yml: 'linteryml.config.js' },
        css: true,
        yml: true,
      };

      await run(input);

      expect(mockedLinters.css.run).toHaveBeenCalledWith(
        ['foo.css'],
        'lintercss.config.js',
      );
      expect(mockedLinters.yml.run).toHaveBeenCalledWith(
        ['foo.css'],
        'linteryml.config.js',
      );
    });
  });
});
