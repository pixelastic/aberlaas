const helper = require('../../../helper.js');
const lint = require('../index.js');
const current = require('../js.js');
const read = require('firost/read');
const write = require('firost/write');
const writeJson = require('firost/writeJson');
const emptyDir = require('firost/emptyDir');

describe('lint-js', () => {
  const tmpDirectory = './tmp/lint/js';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
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

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(current, '__run');
      const actual = await current.run();

      expect(actual).toEqual(true);
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

      expect(actual.code).toEqual('JavaScriptLintError');
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

      expect(actual).toEqual(true);
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

      expect(actual.code).toEqual('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('  const foo = "bar"; alert(foo)', helper.hostPath('foo.js'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.js'));

      expect(actual).toEqual("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await current.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
