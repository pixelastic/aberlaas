import module from '../build';
import helper from '../../helper';
import { _ } from 'golgoth';
import firost from 'firost';

describe('build', () => {
  describe('configFile', () => {
    it('should take the --config CLI option first', async () => {
      const cliArgs = { config: 'fooCli' };
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fooCli');
    });
    it('should take the babel.config.js in the host as fallback', async () => {
      const cliArgs = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/host/babel.config.js');
    });
    it('should take the aberlaas default if no babel.config.js in the host', async () => {
      const cliArgs = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./nope');
      jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/aberlaas/configs/babel.js');
    });
  });
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
    // Converts an array of ignore patterns into an array of glob patterns
    // This will find everything, then ignore the rest
    function buildIgnoreGlob(ignorePatterns) {
      const glob = ['fixtures/host/**/*.js'];
      _.each(ignorePatterns, ignore => {
        glob.push(`!${ignore}`);
      });
      return glob;
    }
    beforeEach(() => {
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
    });
    it('should all start with the host root', () => {
      const actual = module.ignorePatterns();

      expect(actual[0]).toMatch(/^fixtures\/host/);
      expect(actual[1]).toMatch(/^fixtures\/host/);
    });
    it('should ignore files in __tests__ directory', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/__tests__/foo.js');
    });
    it('should ignore *.test.js files', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/foo.test.js');
    });
    it('should ignore test-helper.js files', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/test-helper.js');
    });
    it('should ignore any file in node_modules', async () => {
      const actual = buildIgnoreGlob(module.ignorePatterns());

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/node_modules/foo/foo.js');
    });
    it('should ignore specific files', async () => {
      const cliArgs = { ignore: ['bar.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/bar.js');
    });
    it('should ignore specific patterns', async () => {
      const cliArgs = { ignore: ['b*.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/bar.js');
    });
    it('should allow several ignore patterns', async () => {
      const cliArgs = { ignore: ['b*.js', 'foo.js'] };
      const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

      const files = await firost.glob(actual);

      expect(files).not.toContain('fixtures/host/lib/bar.js');
      expect(files).not.toContain('fixtures/host/lib/foo.js');
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

      expect(actual).toContain('--config-file foo');
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
      expect(actual).toContain('--ignore fixtures/host/**/__tests__');
      expect(actual).toContain('--ignore fixtures/host/**/*.test.js');
      expect(actual).toContain('--ignore fixtures/host/**/test-helper.js');
      expect(actual).toContain('--ignore fixtures/host/**/node_modules');
      expect(actual).toContain('--config-file fixtures/host/babel.config.js');
      expect(actual).toContain('--out-dir ./build');
      expect(actual).toContain('--verbose');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(firost, 'mkdirp').mockImplementation();
      jest.spyOn(helper, 'spawn').mockImplementation();
    });
    it('should create the output dir', async () => {
      jest.spyOn(firost, 'mkdirp');
      jest.spyOn(module, 'outputDir').mockReturnValue('foo');
      await module.run();

      expect(firost.mkdirp).toHaveBeenCalledWith('foo');
    });
    it('should spawn babel binary with cli options', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('babel-cli');
      jest.spyOn(module, 'babelCliArguments').mockReturnValue('args');
      await module.run();

      expect(helper.spawn).toHaveBeenCalledWith('babel-cli', 'args');
    });
  });
});
