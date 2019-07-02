import module from '../test';
import helper from '../../helper';
import path from 'path';

describe('test', () => {
  let hostRoot = path.resolve('fixtures/host');
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(hostRoot);
    jest.spyOn(helper, 'aberlaasRoot').mockReturnValue('./fixtures/aberlaas');
  });
  describe('jestCliArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['foo', 'bar', 'baz'] };
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toMatch(/^foo bar baz/);
    });
    it('should allow specifying the config file', async () => {
      const input = { config: 'custom.jest.config.js' };
      const actual = (await module.jestCliArguments(input)).join(' ');

      expect(actual).toContain(
        `--config ${helper.hostPath('custom.jest.config.js')}`
      );
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
      expect(actual).toContain(`--config ${helper.hostPath('jest.config.js')}`);
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
