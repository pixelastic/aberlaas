import helper from '../../helper';
import lint from '../lint';
import module from '../lint-css';
import firost from 'firost';

describe('lint-css', () => {
  const tmpDirectory = './tmp/lint/css';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await firost.emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get css files', async () => {
      await firost.write('foo: bar', helper.hostPath('foo.css'));
      await firost.write('foo: bar', helper.hostPath('deep/foo.css'));
      await firost.write('foo: bar', helper.hostPath('nope.txt'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.css'));
      expect(actual).toContain(helper.hostPath('deep/foo.css'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await firost.write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(firost, 'run');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(firost.run).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await firost.write('body { color: red; }', helper.hostPath('good.css'));
      await firost.write('body{color:       red;}', helper.hostPath('bad.css'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toEqual('ERROR_CSS_LINT');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await firost.write('body { color: red; }', helper.hostPath('good.css'));
      await firost.write('body{color:       red;}', helper.hostPath('bad.css'));
      await firost.write(
        '   body{color:   red;}',
        helper.hostPath('deep/bad.css')
      );

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('bad.css')
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bad.css')
      );
    });
    it('should allow specifying the config file to use', async () => {
      await firost.write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('should not error if specified files do not exist', async () => {
      jest
        .spyOn(module, 'getInputFiles')
        .mockReturnValue([helper.hostPath('nope.css')]);

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await firost.write('body{color:       red;}', helper.hostPath('foo.css'));

      await module.fix();

      const actual = await firost.read(helper.hostPath('foo.css'));

      expect(actual).toEqual('body {\n  color: red;\n}');
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
    it('should throw if fix works but linting fails', async () => {
      await firost.write('body{}', helper.hostPath('foo.css'));
      let actual;
      try {
        await module.fix();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ERROR_CSS_LINT');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected empty block')
      );
    });
  });
});
