const helper = require('../../helper');
const lint = require('../lint');
const module = require('../lint-json');
const read = require('firost/lib/read');
const write = require('firost/lib/write');
const emptyDir = require('firost/lib/emptyDir');

describe('lint-json', () => {
  const tmpDirectory = './tmp/lint/json';
  beforeEach(async () => {
    jest.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get json', async () => {
      await write('foo', helper.hostPath('foo.json'));
      await write('foo', helper.hostPath('deep/foo.json'));
      await write('foo', helper.hostPath('nope.txt'));

      const actual = await module.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.json'));
      expect(actual).toContain(helper.hostPath('deep/foo.json'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('foo.json'));

      const actual = await module.run();

      expect(actual).toEqual(true);
    });
    it('stop early if no file found', async () => {
      jest.spyOn(module, '__parse');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(module.__parse).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('bad.json'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toEqual('JsonLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('foo.json'));
      await write('{ "foo": bar }', helper.hostPath('deep/bar.json'));

      let actual = null;
      try {
        await module.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.json')
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.json')
      );
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('{ "foo": "bar", }', helper.hostPath('foo.json'));

      await module.fix();

      const actual = await read(helper.hostPath('foo.json'));

      expect(actual).toEqual('{ "foo": "bar" }');
    });
    it('stop early if no file found', async () => {
      jest.spyOn(lint, 'fixWithPrettier');
      const actual = await module.run();

      expect(actual).toEqual(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
