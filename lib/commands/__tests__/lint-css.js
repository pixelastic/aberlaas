import module from '../lint-css';
import helper from '../../helper';

describe('lint-css', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('getCssFiles', () => {
    it('should pass input files directly', async () => {
      const input = { _: ['./src/'] };
      const actual = await module.getCssFiles(input);

      expect(actual).toContain(helper.hostPath('src/style.css'));
    });
    it('should lint css files by default', async () => {
      const input = {};
      const actual = await module.getCssFiles(input);

      expect(actual).toContain(helper.hostPath('src/style.css'));
    });
  });
  describe('getStylelintArguments', () => {
    it('should allow specifying the config file', async () => {
      const input = { config: '.stylelintrc.custom.js' };
      const actual = (await module.getStylelintArguments(input)).join(' ');

      expect(actual).toContain(`--config ${helper.hostPath(input.config)}`);
    });
    it('should display colored results', async () => {
      const input = {};
      const actual = await module.getStylelintArguments(input);

      expect(actual).toContain('--color');
    });
  });
  describe('getPrettierArguments', () => {
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
    it('should stop early if not file to lint', async () => {
      jest.spyOn(module, 'getCssFiles').mockReturnValue([]);

      const actual = await module.run();

      expect(actual).toEqual(false);
    });
    it('should spawn stylelint binary with cli options', async () => {
      jest.spyOn(module, 'getCssFiles').mockReturnValue(['input.css']);
      jest.spyOn(module, 'getStylelintArguments').mockReturnValue('other args');
      jest.spyOn(helper, 'which').mockReturnValue('stylelint-cli');
      await module.run();

      expect(helper.spawn).toHaveBeenCalledWith('stylelint-cli', [
        'input.css',
        'other args',
      ]);
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
    it('should call prettier on CSS files', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('prettier-cli');
      jest.spyOn(module, 'getPrettierArguments').mockReturnValue('--args');
      jest.spyOn(helper, 'spawn').mockImplementation();
      const input = 'files';

      await module.fix(input);

      expect(helper.spawn).toHaveBeenCalledWith('prettier-cli', [
        'files',
        '--args',
      ]);
    });
  });
});
