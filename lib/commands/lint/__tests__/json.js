import { emptyDir, read, write } from 'firost';
import helper from '../../../helper.js';
import current from '../json.js';

describe('lint-json', () => {
  const tmpDirectory = './tmp/lint/json';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    describe('src/**/*', () => {
      it.each([
        ['src/config.json', true],
        ['src/tool/settings.json', true],
        ['dist/config.json', false],
        ['src-backup/config.json', false],
        ['src/config.txt', false],
      ])('%s : %s', async (filepath, shouldBeIncluded) => {
        const absolutePath = helper.hostPath(filepath);
        await write('something', absolutePath);

        const actual = await current.getInputFiles('src/**/*');

        if (shouldBeIncluded) {
          expect(actual).toContain(absolutePath);
        } else {
          expect(actual).not.toContain(absolutePath);
        }
      });
    });
  });
  describe('run', () => {
    it('should run on all .json files and return true if all passes', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('foo.json'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
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
      const actual = await current.run();
      expect(actual).toBe(true);
    });
  });
});
