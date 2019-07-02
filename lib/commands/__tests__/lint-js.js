import module from '../lint-js';
import helper from '../../helper';
import path from 'path';

describe('lint-js', () => {
  let hostRoot = path.resolve('fixtures/host');
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(hostRoot);
  });
  describe('eslintCliArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['./lib/ba*.js', './lib/foo.js'] };
      const actual = await module.eslintCliArguments(input);

      expect(actual).toContain(helper.hostPath('lib/foo.js'));
      expect(actual).toContain(helper.hostPath('lib/bar.js'));
      expect(actual).toContain(helper.hostPath('lib/baz.js'));
    });
    it('should lint ./lib, and *.js files by default', async () => {
      const input = {};
      const actual = await module.eslintCliArguments(input);

      expect(actual).toContain(helper.hostPath('lib/foo.js'));
      expect(actual).toContain(helper.hostPath('lib/bar.js'));
      expect(actual).toContain(helper.hostPath('lib/baz.js'));
      expect(actual).toContain(helper.hostPath('babel.config.js'));
      expect(actual).toContain(helper.hostPath('.eslintrc.js'));
    });
    it('should allow specifying the config file', async () => {
      const input = { config: '.eslintrc' };
      const actual = (await module.eslintCliArguments(input)).join(' ');

      expect(actual).toContain(`--config ${helper.hostPath(input.config)}`);
    });
    it('should display colored results', async () => {
      const input = {};
      const actual = await module.eslintCliArguments(input);

      expect(actual).toContain('--color');
    });
    it('should fix errors if specified', async () => {
      const input = { fix: true };
      const actual = await module.eslintCliArguments(input);

      expect(actual).toContain('--fix');
    });
    it('should not fix errors if not specified', async () => {
      const input = {};
      const actual = await module.eslintCliArguments(input);

      expect(actual).not.toContain('--fix');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'spawn').mockImplementation();
    });
    it('should spawn eslint binary with cli options', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('eslint-cli');
      jest.spyOn(module, 'eslintCliArguments').mockReturnValue('args');
      await module.run();

      expect(helper.spawn).toHaveBeenCalledWith('eslint-cli', 'args');
    });
  });
});
