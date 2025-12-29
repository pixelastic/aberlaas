import { absolute, emptyDir, read, write } from 'firost';
import helper from 'aberlaas-helper';
import current from '../json.js';

describe('lint-json', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/json');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
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
        const absolutePath = helper.hostGitPath(filepath);
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
      await write('{ "foo": "bar" }', helper.hostGitPath('foo.json'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('should throw if a file errors', async () => {
      await write('{ "foo": "bar" }', helper.hostGitPath('good.json'));
      await write('{ "foo": bar }', helper.hostGitPath('bad.json'));

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
      await write('{ "foo": "bar" }', helper.hostGitPath('good.json'));
      await write('{ "foo": bar }', helper.hostGitPath('foo.json'));
      await write('{ "foo": bar }', helper.hostGitPath('deep/bar.json'));

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
      await write('{ "foo": "bar", }', helper.hostGitPath('foo.json'));

      await current.fix();

      const actual = await read(helper.hostGitPath('foo.json'));

      expect(actual).toBe('{ "foo": "bar" }');
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
  });
});
