import module from '../build';
import helper from '../../helper';
import _ from 'golgoth/lib/lodash';
import glob from 'firost/lib/glob';

describe('build', () => {
  describe('outputDir', () => {
    it('should use the command-line argument', () => {
      const cliArgs = { 'out-dir': 'foo' };
      const actual = module.outputDir(cliArgs);

      expect(actual).toEqual('foo');
    });
    it('should output to ./build by default', () => {
      const cliArgs = {};
      const actual = module.outputDir(cliArgs);

      expect(actual).toEqual('./build');
    });
  });
  describe('ignorePatterns', () => {
    /**
     * Converts an array of ignore patterns into an array of glob patterns
     * This will find everything, then ignore the rest
     * @param {Array} ignorePatterns Array of patterns to ignore
     * @returns {string} Glob matching those patterns
     **/
    function buildIgnoreGlob(ignorePatterns) {
      const globPatterns = [helper.hostPath('**/*.js')];
      _.each(ignorePatterns, ignore => {
        globPatterns.push(`!${ignore}`);
      });
      return globPatterns;
    }
    beforeEach(() => {
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
    });
    it('should all start with the host root', () => {
      const actual = module.ignorePatterns();

      expect(actual[0]).toMatch(helper.hostPath('.'));
      expect(actual[1]).toMatch(helper.hostPath('.'));
    });
    it('should ignore files in __tests__ directory', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/__tests__/foo.js'));
    });
    it('should ignore *.test.js files', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/foo.test.js'));
    });
    it('should ignore test-helper.js files', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/test-helper.js'));
    });
    it('should ignore any file in node_modules', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('node_modules/foo/foo.js'));
    });
    it('should ignore specific files', async () => {
      const cliArgs = { ignore: ['bar.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/bar.js'));
    });
    it('should ignore specific patterns', async () => {
      const cliArgs = { ignore: ['b*.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/bar.js'));
    });
    it('should allow several ignore patterns', async () => {
      const cliArgs = { ignore: ['b*.js', 'foo.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await glob(actual);

      expect(files).not.toContain(helper.hostPath('lib/bar.js'));
      expect(files).not.toContain(helper.hostPath('lib/foo.js'));
    });
  });
  describe('babelCliArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['foo', 'bar', 'baz'] };
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toMatch(/^foo bar baz/);
    });
    it('should pass ignore patterns', async () => {
      const input = { ignore: ['foo', 'bar'] };
      jest.spyOn(helper, 'hostRoot').mockReturnValue('/host/');
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toContain('--ignore /host/**/foo');
      expect(actual).toContain('--ignore /host/**/bar');
    });
    it('should allow specifying the config file', async () => {
      const input = { config: 'foo' };
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toContain(`--config-file ${helper.hostPath('foo')}`);
    });
    it('should allow specifying the output directory', async () => {
      const input = { 'out-dir': 'dist' };
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toContain('--out-dir dist');
    });
    it('should be verbose', async () => {
      const input = {};
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toContain('--verbose');
    });
    it('should enable watch mode if --watch', async () => {
      const input = { watch: true };
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toContain('--watch');
      expect(actual).toContain('--source-maps inline');
    });
    it('should not enable watch mode if not --watch', async () => {
      const input = {};
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).not.toContain('--watch');
    });
    it('should use default values if nothing passed', async () => {
      const input = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host/');
      const actual = (await module.babelCliArguments(input)).join(' ');

      expect(actual).toMatch(/^.\/lib/);
      expect(actual).toContain(`--ignore ${helper.hostPath('**/__tests__')}`);
      expect(actual).toContain(`--ignore ${helper.hostPath('**/*.test.js')}`);
      expect(actual).toContain(
        `--ignore ${helper.hostPath('**/test-helper.js')}`
      );
      expect(actual).toContain(
        `--ignore ${helper.hostPath('**/node_modules')}`
      );
      expect(actual).toContain(
        `--config-file ${helper.hostPath('babel.config.js')}`
      );
      expect(actual).toContain('--out-dir ./build');
      expect(actual).toContain('--verbose');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(module, '__mkdirp').mockImplementation();
      jest.spyOn(module, '__run').mockReturnValue({
        stdout: {
          pipe() {},
        },
      });
    });
    it('should create the output dir', async () => {
      jest.spyOn(module, '__mkdirp');
      jest.spyOn(module, 'outputDir').mockReturnValue('foo');
      await module.run();

      expect(module.__mkdirp).toHaveBeenCalledWith('foo');
    });
    it('should spawn babel binary with cli options', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('babel-cli');
      jest.spyOn(module, 'babelCliArguments').mockReturnValue(['args']);
      await module.run();

      expect(module.__run).toHaveBeenCalledWith('babel-cli args');
    });
  });
});
