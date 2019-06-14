import module from '../lint';
import helper from '../../helper';

describe('lint', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('fixtures/host');
  });
  describe('inputFiles', () => {
    it('should allow overriding list of files with cli arguments', () => {
      const cliArgs = { _: ['foo', 'bar', 'baz'] };
      const actual = module.inputFiles(cliArgs);

      expect(actual).toContain('fixtures/host/foo');
      expect(actual).toContain('fixtures/host/bar');
      expect(actual).toContain('fixtures/host/baz');
    });
    it('should lint in ./lib by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toContain('fixtures/host/lib');
    });
    it('should lint in ./lib if no args passed', () => {
      const cliArgs = { _: [] };
      const actual = module.inputFiles(cliArgs);

      expect(actual).toContain('fixtures/host/lib');
    });
    it('should lint all .js files at the root by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toContain('fixtures/host/*.js');
    });
    it('should lint all hidden .js files at the root by default', () => {
      const cliArgs = {};
      const actual = module.inputFiles(cliArgs);

      expect(actual).toContain('fixtures/host/.*.js');
    });
  });
  describe('eslintCliArguments', () => {
    it('should pass input files directly', () => {
      const input = { _: ['foo', 'bar', 'baz'] };
      const actual = module.eslintCliArguments(input);

      expect(actual[0]).toEqual('fixtures/host/foo');
      expect(actual[1]).toEqual('fixtures/host/bar');
      expect(actual[2]).toEqual('fixtures/host/baz');
    });
    it('should lint ./lib, and *.js files by default', () => {
      const input = {};
      const actual = module.eslintCliArguments(input);

      expect(actual[0]).toEqual('fixtures/host/lib');
      expect(actual[1]).toEqual('fixtures/host/*.js');
      expect(actual[2]).toEqual('fixtures/host/.*.js');
    });
    it('should display colored results', () => {
      const input = {};
      const actual = module.eslintCliArguments(input);

      expect(actual).toContain('--color');
    });
    it('should fix errors if specified', () => {
      const input = { fix: true };
      const actual = module.eslintCliArguments(input);

      expect(actual).toContain('--fix');
    });
    it('should not fix errors if not specified', () => {
      const input = {};
      const actual = module.eslintCliArguments(input);

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
