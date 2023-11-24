import helper from '../../../helper.js';
import lint from '../index.js';
import current from '../json.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import emptyDir from 'firost/emptyDir.js';

describe('lint-json', () => {
  const tmpDirectory = './tmp/lint/json';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get json', async () => {
      await write('foo', helper.hostPath('foo.json'));
      await write('foo', helper.hostPath('deep/foo.json'));
      await write('foo', helper.hostPath('nope.txt'));

      const actual = await current.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.json'));
      expect(actual).toContain(helper.hostPath('deep/foo.json'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('foo.json'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__parse');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__parse).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('bad.json'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JsonLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('foo.json'));
      await write('{ "foo": bar }', helper.hostPath('deep/bar.json'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.json'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.json'),
      );
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('{ "foo": "bar", }', helper.hostPath('foo.json'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.json'));

      expect(actual).toBe('{ "foo": "bar" }');
    });
    it('stop early if no file found', async () => {
      vi.spyOn(lint, 'fixWithPrettier');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
