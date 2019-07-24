import module from '../test';
import helper from '../../helper';

describe('test', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('getTestInputs', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['./lib/foo.js'] };
      const actual = await module.getTestInputs(input);

      expect(actual).toContain('./lib/foo.js');
    });
    it('should apply directly on root if no input specified', async () => {
      const input = { _: [] };
      const actual = await module.getTestInputs(input);

      expect(Array.isArray(actual)).toBe(true);
      expect(actual).toContain(helper.hostPath('.'));
    });
  });
  describe('jestCliArguments', () => {
    it('should run jest on the correct test inputs', async () => {
      jest.spyOn(module, 'getTestInputs').mockReturnValue(['inputFiles']);
      const input = {};
      const actual = await module.jestCliArguments(input);

      expect(actual[0]).toEqual('inputFiles');
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
    it('should use default config file if none specified', async () => {
      const input = {};
      const actual = (await module.jestCliArguments(input)).join(' ');

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
