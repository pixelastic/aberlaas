import module from '../lint-yml';
import { write, read, emptyDir } from 'firost';
import helper from '../../helper';

describe('lint-yml', () => {
  const tmpDirectory = './tmp/lint/yml';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should find .yml and .yaml files', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/folder/foo.yaml'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/folder/foo.yaml'));
    });
    it('should restrict search to arguments passed', async () => {
      await write('foo', helper.hostPath('foo.yml'));
      await write('foo', helper.hostPath('deep/folder/foo.yaml'));

      const input = { _: ['./deep/**/*'] };
      const actual = await module.getInputFiles(input);

      expect(actual).not.toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/folder/foo.yaml'));
    });
    it('should find files in .github directory', async () => {
      await write('foo', helper.hostPath('.github/workflows/foo.yml'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('.github/workflows/foo.yml'));
    });
  });
  describe('lint', () => {
    it('should return true if valid', async () => {
      const input = 'foo: bar';

      const actual = await module.lint(input);

      expect(actual).toEqual(true);
    });
    it('should throw if invalid', async () => {
      const input = 'foo: ****';

      let actual;
      try {
        await module.lint(input);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'YAMLException');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(process, 'exit').mockReturnValue();
      jest.spyOn(helper, 'consoleError').mockReturnValue();
    });
    it('should return true if all passes', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('should stop if a file errors', async () => {
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('bad.yml'));

      await module.run();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
    it('should display all errors if a file fails', async () => {
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('foo.yml'));
      await write('foo: ****', helper.hostPath('deep/bar.yml'));

      await module.run();

      expect(helper.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('foo.yml')
      );
      expect(helper.consoleError).toHaveBeenCalledWith(
        expect.stringContaining('deep/bar.yml')
      );
    });
  });
  describe('fix', () => {
    it('should lint files', async () => {
      await write('    foo: "bar"', helper.hostPath('foo.yml'));

      await module.fix();

      const actual = await read(helper.hostPath('foo.yml'));

      expect(actual).toEqual("foo: 'bar'");
    });
  });
});
