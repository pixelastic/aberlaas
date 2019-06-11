import module from '../test';
import helper from '../../helper';
// import { _ } from 'golgoth';
// import firost from 'firost';

describe('test', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
    jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
  });
  describe('inputFiles', () => {
    it('should use the command-line arguments', () => {
      const cliArgs = { _: ['foo', 'bar', 'baz'] };
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['foo', 'bar', 'baz']);
    });
    it('should test files in ./lib by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toEqual(['./lib']);
    });
  });
  describe('configFile', () => {
    it('should take the --config CLI option first', async () => {
      const cliArgs = { config: 'custom.jest.config.js' };
      const actual = await module.configFile(cliArgs);
      expect(actual).toEqual('custom.jest.config.js');
    });
    it('should take the jest.config.js in the host if nothing defined', async () => {
      const cliArgs = {};
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/host/jest.config.js');
    });
    it('should take the aberlaas default if no jest.config.js in the host', async () => {
      const cliArgs = {};
      jest.spyOn(helper, 'hostRoot').mockReturnValue('./nope');
      const actual = await module.configFile(cliArgs);

      expect(actual).toEqual('fixtures/aberlaas/configs/jest.js');
    });
  });
  describe('jestCliArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['foo', 'bar', 'baz'] };
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toMatch(/^foo bar baz/);
    });
    it('should allow specifying the config file', async () => {
      const input = { config: 'foo' };
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toContain('--config foo');
    });
    it('should pass if no tests', async () => {
      const input = {};
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toContain('--passWithNoTests');
    });
    it('should not use caching', async () => {
      const input = {};
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toContain('--no-cache');
    });
    it('should enable watch mode if --watch', async () => {
      const input = { watch: true };
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toContain('--watch');
      expect(actual).toContain('--no-watchman');
    });
    it('should not enable watch mode if not --watch', async () => {
      const input = {};
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).not.toContain('--watch');
    });
    it('should use default values if nothing passed', async () => {
      const input = {};
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toMatch(/^.\/lib/);
      expect(actual).toContain('--config fixtures/host/jest.config.js');
    });
  });
  describe('run', () => {
    it('should run jest tests with cli options', async () => {
      jest.spyOn(module, '__jestRun').mockImplementation();
      jest.spyOn(module, 'jestCliArguments').mockReturnValue('args');
      await module.run();

      expect(module.__jestRun).toHaveBeenCalledWith('args');
    });
  });
});
