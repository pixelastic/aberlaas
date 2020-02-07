import helper from '../../helper';
import lint from '../lint';
import module from '../lint-js';
import read from 'firost/lib/read';
import write from 'firost/lib/write';
import emptyDir from 'firost/lib/emptyDir';

describe('lint-js', () => {
  const tmpDirectory = './tmp/lint/js';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get js files', async () => {
      await write('foo', helper.hostPath('foo.js'));
      await write('foo', helper.hostPath('deep/foo.js'));
      await write('foo', helper.hostPath('nope.txt'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.js'));
      expect(actual).toContain(helper.hostPath('deep/foo.js'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('foo.js')
      );

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(module, '__run');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(module.__run).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('good.js')
      );
      await write('  const foo = "bar"', helper.hostPath('bad.js'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toEqual('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('good.js')
      );
      await write('  const foo = "bar"', helper.hostPath('foo.js'));
      await write('  const foo = "bar"', helper.hostPath('deep/bar.js'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.js')
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.js')
      );
    });
    it('should ignore files in .yarn', async () => {
      await write(
        "     const foo = 'bad'",
        helper.hostPath('.yarn/releases/yarn.js')
      );
      await write(
        "const foo = 'good';\nalert(foo);\n",
        helper.hostPath('good.js')
      );

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('  const foo = "bar"; alert(foo)', helper.hostPath('foo.js'));

      await module.fix();

      const actual = await read(helper.hostPath('foo.js'));

      expect(actual).toEqual("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
