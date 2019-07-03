import module from '../lint-json';
import helper from '../../helper';

describe('lint-json', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('getJsonlintArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['./lib/*.json', './package.json'] };
      const actual = await module.getJsonlintArguments(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should lint root and subfolders', async () => {
      const input = {};
      const actual = await module.getJsonlintArguments(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should display compact results', async () => {
      const input = {};
      const actual = await module.getJsonlintArguments(input);

      expect(actual).toContain('--compact');
      expect(actual).toContain('--quiet');
    });
  });
  describe('getPrettierArguments', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['./lib/*.json', './package.json'] };
      const actual = await module.getPrettierArguments(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should lint root and subfolders', async () => {
      const input = {};
      const actual = await module.getPrettierArguments(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should fix files in place', async () => {
      const input = {};
      const actual = await module.getPrettierArguments(input);

      expect(actual).toContain('--write');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'spawn').mockImplementation();
    });
    it('should spawn jsonlint binary with cli options', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('jsonlint-cli');
      jest.spyOn(module, 'getJsonlintArguments').mockReturnValue('args');
      await module.run();

      expect(helper.spawn).toHaveBeenCalledWith('jsonlint-cli', 'args');
    });
    it('should call fix() if --fix is passed', async () => {
      const cliArgs = { fix: true };
      jest.spyOn(module, 'fix').mockReturnValue();

      await module.run(cliArgs);

      expect(module.fix).toHaveBeenCalled();
      expect(helper.spawn).not.toHaveBeenCalled();
    });
  });
  describe('fix', () => {
    it('should call prettier on files', async () => {
      const cliArgs = { fix: true };
      jest.spyOn(helper, 'which').mockReturnValue('prettier-cli');
      jest.spyOn(helper, 'spawn').mockReturnValue();
      jest
        .spyOn(module, 'getPrettierArguments')
        .mockReturnValue('prettier-args');

      await module.fix(cliArgs);

      expect(helper.which).toHaveBeenCalledWith('prettier');
      expect(helper.spawn).toHaveBeenCalledWith(
        'prettier-cli',
        'prettier-args'
      );
    });
  });
});
