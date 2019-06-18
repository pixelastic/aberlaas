import module from '../lint';
import helper from '../../helper';
import path from 'path';

describe('lint', () => {
  let hostRoot = path.resolve('fixtures/host');
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(hostRoot);
  });
  describe('inputFiles', () => {
    it('should allow passing custom glob of files', async () => {
      const cliArgs = { _: ['./lib/ba*.js'] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('lib/bar.js'));
      expect(actual).toContain(helper.hostPath('lib/baz.js'));
    });
    it('should not return absolute path even if absolute path already given', async () => {
      const cliArgs = { _: [helper.hostPath('lib/foo.js')] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('lib/foo.js'));
    });
    it('should remove paths that do not exist', async () => {
      const cliArgs = { _: ['./nope'] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toHaveLength(0);
    });
    it('should only return js files', async () => {
      const cliArgs = { _: ['./lib'] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).not.toContain(helper.hostPath('lib/assets'));
      expect(actual).not.toContain(helper.hostPath('lib/assets/001.jpg'));
      expect(actual).not.toContain(helper.hostPath('lib/assets/002.gif'));
      expect(actual).not.toContain(helper.hostPath('lib/assets/003.md'));
    });
    it('should lint in ./lib by default', async () => {
      const cliArgs = {};
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('lib/foo.js'));
      expect(actual).toContain(helper.hostPath('lib/bar.js'));
      expect(actual).toContain(helper.hostPath('lib/baz.js'));
    });
    it('should lint in ./lib if no args passed', async () => {
      const cliArgs = { _: [] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('lib/foo.js'));
      expect(actual).toContain(helper.hostPath('lib/bar.js'));
      expect(actual).toContain(helper.hostPath('lib/baz.js'));
    });
    it('should lint all .js files at the root by default', async () => {
      const cliArgs = { _: [] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('babel.config.js'));
      expect(actual).toContain(helper.hostPath('jest.config.js'));
    });
    it('should lint all hidden .js files at the root by default', async () => {
      const cliArgs = { _: [] };
      const actual = await module.inputFiles(cliArgs);

      expect(actual).toContain(helper.hostPath('.eslintrc.js'));
    });
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
