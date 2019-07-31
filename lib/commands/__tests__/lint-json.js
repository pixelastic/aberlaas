import module from '../lint-json';
import helper from '../../helper';

describe('lint-json', () => {
  beforeEach(() => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./fixtures/host');
  });
  describe('getInputFiles', () => {
    it('should return only json files', async () => {
      const input = { _: ['./**/*'] };
      const actual = await module.getInputFiles(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should search all files in the root', async () => {
      const input = {};
      const actual = await module.getInputFiles(input);

      expect(actual).toContain(helper.hostPath('lib/data.json'));
      expect(actual).toContain(helper.hostPath('package.json'));
    });
    it('should return empyt array if no match', async () => {
      const input = { _: ['./nope/**/*.not-json'] };
      const actual = await module.getInputFiles(input);

      expect(actual).toEqual([]);
    });
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
    it('should return false if no files are matching', async () => {
      const input = { _: ['./*.not-json'] };
      const actual = await module.getJsonlintArguments(input);

      expect(actual).toEqual(false);
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
    it('should return false if no files are matching', async () => {
      const input = { _: ['./*.not-json'] };
      const actual = await module.getPrettierArguments(input);

      expect(actual).toEqual(false);
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
    it('should do nothing if no files are found', async () => {
      const cliArgs = { _: ['./*.not-json'] };

      await module.run(cliArgs);

      expect(helper.spawn).not.toHaveBeenCalled();
    });
  });
  describe('fix', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'spawn').mockReturnValue();
    });
    it('should call prettier on files', async () => {
      jest.spyOn(helper, 'which').mockReturnValue('prettier-cli');
      jest
        .spyOn(module, 'getPrettierArguments')
        .mockReturnValue('prettier-args');

      await module.fix();

      expect(helper.which).toHaveBeenCalledWith('prettier');
      expect(helper.spawn).toHaveBeenCalledWith(
        'prettier-cli',
        'prettier-args'
      );
    });
    it('should do nothing if no files are found', async () => {
      const cliArgs = { _: ['./*.not-json'] };

      await module.fix(cliArgs);

      expect(helper.spawn).not.toHaveBeenCalled();
    });
  });
});
