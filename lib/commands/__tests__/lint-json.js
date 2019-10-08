import module from '../lint-json';
import helper from '../../helper';
import firost from 'firost';

describe('lint-json', () => {
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue('./tmp/lint/json');
    await firost.emptyDir(helper.hostRoot());
  });
  describe('getInputFiles', () => {
    it('should return only json files even if large glob specified', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));
      await firost.write('foo', helper.hostPath('foo.txt'));

      const input = { _: ['./**/*'] };
      const actual = await module.getInputFiles(input);

      expect(actual).toContain(helper.hostPath('foo.json'));
      expect(actual).not.toContain(helper.hostPath('foo.txt'));
    });
    it('should search all files in the root by default', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));
      await firost.writeJson({}, helper.hostPath('subdir/foo.json'));

      const input = {};
      const actual = await module.getInputFiles(input);

      expect(actual).toContain(helper.hostPath('foo.json'));
      expect(actual).toContain(helper.hostPath('subdir/foo.json'));
    });
    it('should return empty array if no match', async () => {
      const input = { _: ['./nope/**/*.not-json'] };
      const actual = await module.getInputFiles(input);

      expect(actual).toEqual([]);
    });
  });
  describe('getPrettierArguments', () => {
    it('should pass input files directly', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));
      await firost.writeJson({}, helper.hostPath('subdir/foo.json'));

      const input = { _: ['./subdir/*.json', './foo.json'] };
      const actual = await module.getPrettierArguments(input);

      expect(actual).toContain(helper.hostPath('subdir/foo.json'));
      expect(actual).toContain(helper.hostPath('foo.json'));
    });
    it('should lint root and subfolders', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));
      await firost.writeJson({}, helper.hostPath('subdir/foo.json'));

      const input = {};
      const actual = await module.getPrettierArguments(input);

      expect(actual).toContain(helper.hostPath('subdir/foo.json'));
      expect(actual).toContain(helper.hostPath('foo.json'));
    });
    it('should fix files in place', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));

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
      jest.spyOn(process, 'exit').mockReturnValue();
      jest.spyOn(module, 'output').mockReturnValue();
    });
    it('should return true if no error', async () => {
      await firost.writeJson({}, helper.hostPath('foo.json'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('should stop process if json is invalid', async () => {
      await firost.write('invalid json', helper.hostPath('foo.json'));

      await module.run();

      expect(process.exit).toHaveBeenCalled();
    });
    it('should display the filename and error when found', async () => {
      await firost.write('invalid json', helper.hostPath('foo.json'));

      await module.run();

      expect(module.output).toHaveBeenCalledWith(
        expect.toStartWith('Unexpected token')
      );
      expect(module.output).toHaveBeenCalledWith(expect.toInclude('foo.json'));
    });
    it('should display all errors and filenames', async () => {
      await firost.write('invalid json', helper.hostPath('foo.json'));
      await firost.write('invalid json', helper.hostPath('bar.json'));

      await module.run();

      expect(module.output).toHaveBeenCalledWith(expect.toInclude('foo.json'));
      expect(module.output).toHaveBeenCalledWith(expect.toInclude('bar.json'));
    });
    it('should call fix() if --fix is passed', async () => {
      const cliArgs = { fix: true };
      jest.spyOn(module, 'fix').mockReturnValue();

      await module.run(cliArgs);

      expect(module.fix).toHaveBeenCalled();
    });
    it('should return true if no files are passed', async () => {
      const cliArgs = { _: ['./*.not-json'] };

      const actual = await module.run(cliArgs);

      expect(actual).toEqual(true);
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
