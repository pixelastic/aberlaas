const current = require('../test');
const helper = require('../../helper');
const write = require('firost/write');

describe('test', () => {
  const tmpDirectory = './tmp/test';
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
  });
  describe('jestCliArguments', () => {
    it('should run jest on the correct test inputs', async () => {
      const input = { _: ['foo.js', 'bar.js'] };
      const actual = await current.jestCliArguments(input);

      expect(actual[0]).toEqual('foo.js');
      expect(actual[1]).toEqual('bar.js');
    });
    it('should allow specifying the config file', async () => {
      const input = { config: 'custom.jest.config.js' };
      const actual = (await current.jestCliArguments(input)).join(' ');

      expect(actual).toContain(
        `--config ${helper.hostPath('custom.jest.config.js')}`
      );
    });
    it('should use project config file if none specified', async () => {
      await write('', helper.hostPath('jest.config.js'));
      const input = {};
      const actual = (await current.jestCliArguments(input)).join(' ');

      expect(actual).toContain(`--config ${helper.hostPath('jest.config.js')}`);
    });
    it('should pass if no tests', async () => {
      const input = {};
      const actual = await current.jestCliArguments(input);

      expect(actual).toContain('--passWithNoTests');
    });
    it('should not use caching', async () => {
      const input = {};
      const actual = await current.jestCliArguments(input);

      expect(actual).toContain('--no-cache');
    });
    it('should enable watch mode if --watch', async () => {
      const input = { watch: true };
      const actual = await current.jestCliArguments(input);

      expect(actual).toContain('--watch');
      expect(actual).toContain('--no-watchman');
    });
    it('should not enable watch mode if not --watch', async () => {
      const input = {};
      const actual = await current.jestCliArguments(input);

      expect(actual).not.toContain('--watch');
    });
    it('should allow passing options to jest directly', async () => {
      const input = { bail: true, findRelatedTests: true };
      const actual = await current.jestCliArguments(input);

      expect(actual).toContain('--bail');
      expect(actual).toContain('--findRelatedTests');
    });
    it('should handle failFast', async () => {
      jest.spyOn(current, 'setEnv').mockReturnValue();
      const input = { failFast: true };

      const actual = await current.jestCliArguments(input);

      expect(actual).not.toContain('--failFast');
      expect(current.setEnv).toHaveBeenCalledWith(
        'ABERLAAS_TEST_FAIL_FAST',
        true
      );
    });
  });
  describe('run', () => {
    it('should run jest tests with cli options', async () => {
      jest.spyOn(current, '__jestRun').mockImplementation();
      jest.spyOn(current, 'jestCliArguments').mockReturnValue('args');
      await current.run();

      expect(current.__jestRun).toHaveBeenCalledWith('args');
    });
  });
});
