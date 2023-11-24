import helper from '../../../helper.js';
import lint from '../index.js';
import current from '../js.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import writeJson from 'firost/writeJson.js';
import emptyDir from 'firost/emptyDir.js';

describe('lint-js', () => {
  const tmpDirectory = './tmp/lint/js';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    await writeJson({}, helper.hostPath('package.json'));
  });
  describe('getInputFiles', () => {
    it('should get js files', async () => {
      await write('foo', helper.hostPath('foo.js'));
      await write('foo', helper.hostPath('deep/foo.js'));
      await write('foo', helper.hostPath('nope.txt'));

      const actual = await current.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.js'));
      expect(actual).toContain(helper.hostPath('deep/foo.js'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('foo.js'),
      );

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__run');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__run).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPath('bad.js'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPath('foo.js'));
      await write('  const foo = "bar"', helper.hostPath('deep/bar.js'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.js'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.js'),
      );
    });
    it('should ignore files in .yarn', async () => {
      await write(
        "     const foo = 'bad'",
        helper.hostPath('.yarn/releases/yarn.js'),
      );
      await write(
        "const foo = 'good';\nalert(foo);\n",
        helper.hostPath('good.js'),
      );

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('should lint files defined in .bin key in package.json', async () => {
      await writeJson(
        {
          bin: {
            foo: './bin/foo',
          },
        },
        helper.hostPath('package.json'),
      );
      await write('  const foo = "bar"', helper.hostPath('./bin/foo'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('  const foo = "bar"; alert(foo)', helper.hostPath('foo.js'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      vi.spyOn(lint, 'fixWithPrettier');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
