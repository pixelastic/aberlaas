import module from '../build';
import helper from '../../helper';
import { _, firost } from 'golgoth';

describe('build', () => {
  describe('inputFiles', () => {
    it('should use the command-line arguments', () => {
      const cliArgs = { _: ['foo', 'bar', 'baz'] };
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['foo', 'bar', 'baz']);
    });
    it('should read from ./lib by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['./lib']);
    });
  });
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
    it('should read from ./lib by default', () => {
      const cliArgs = {};
      const actual = module.outputDir(cliArgs);

      expect(actual).toEqual(['./build']);
    });
  });
  // describe('ignorePatterns', () => {
  //   // Converts an array of ignore patterns into an array of glob patterns
  //   // This will find everything, then ignore the rest
  //   function buildIgnoreGlob(ignorePatterns) {
  //     const glob = ['fixtures/host/**/*.js'];
  //     _.each(ignorePatterns, ignore => {
  //       glob.push(`!${ignore}`);
  //     });
  //     return glob;
  //   }
  //   beforeEach(() => {
  //     jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  //   });
  //   it('should all start with the host root', () => {
  //     const actual = module.ignorePatterns();

  //     expect(actual[0]).toMatch(/^fixtures\/host/);
  //     expect(actual[1]).toMatch(/^fixtures\/host/);
  //   });
  //   it('should ignore files in __tests__ directory', async () => {
  //     const actual = buildIgnoreGlob(module.ignorePatterns());

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/__tests__/foo.js');
  //   });
  //   it('should ignore *.test.js files', async () => {
  //     const actual = buildIgnoreGlob(module.ignorePatterns());

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/foo.test.js');
  //   });
  //   it('should ignore test-helper.js files', async () => {
  //     const actual = buildIgnoreGlob(module.ignorePatterns());

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/test-helper.js');
  //   });
  //   it('should ignore any file in node_modules', async () => {
  //     const actual = buildIgnoreGlob(module.ignorePatterns());

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/node_modules/foo/foo.js');
  //   });
  //   it('should ignore specific files', async () => {
  //     const cliArgs = { ignore: ['bar.js'] };
  //     const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/bar.js');
  //   });
  //   it('should ignore specific patterns', async () => {
  //     const cliArgs = { ignore: ['b*.js'] };
  //     const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/bar.js');
  //   });
  //   it('should allow several ignore patterns', async () => {
  //     const cliArgs = { ignore: ['b*.js', 'foo.js'] };
  //     const actual = buildIgnoreGlob(module.ignorePatterns(cliArgs));

  //     const files = await firost.glob(actual);

  //     expect(files).not.toContain('fixtures/host/lib/bar.js');
  //     expect(files).not.toContain('fixtures/host/lib/foo.js');
  //   });
  // });
});
