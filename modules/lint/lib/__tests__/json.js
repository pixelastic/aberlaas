import { absolute, emptyDir, newFile, read, write, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import current from '../json.js';

describe('lint-json', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/json');
  beforeEach(async () => {
    await emptyDir(tmpDirectory);

    // We mock them all so a bug doesn't just wipe our real aberlaas repo
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${tmpDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${tmpDirectory}/lib/src`,
    );
  });
  describe('getInputFiles', () => {
    describe('tools/**/*', () => {
      it.each([
        ['config.json', false],
        ['lib/config.json', false],
        ['lib/src/config.json', false],

        ['lib/tools/config.json', true],
        ['lib/tools/subdir/config.json', true],

        ['lib/tools/config.txt', false],
        ['lib/tools-backup/config.json', false],
        ['lib/tools/dist/config.json', false],
      ])('%s : %s', async (filepath, shouldBeIncluded) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFiles('tools/**/*');

        if (shouldBeIncluded) {
          expect(actual).toContain(absolutePath);
        } else {
          expect(actual).not.toContain(absolutePath);
        }
      });
    });
  });
  describe('run', () => {
    it('should throw if a file errors', async () => {
      await writeJson({ foo: 'bar' }, helper.hostPackagePath('good.json'));
      await write('{ "foo": bar }', helper.hostPackagePath('bad.json'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JsonLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should run on all .json files and return true if all passes', async () => {
      await writeJson({ foo: 'bar' }, helper.hostPackagePath('foo.json'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('should throw all error message if a file fails', async () => {
      await writeJson({ foo: 'bar' }, helper.hostPackagePath('good.json'));
      await write('{ "foo": bar }', helper.hostPackagePath('foo.json'));
      await write('{ "foo": bar }', helper.hostPackagePath('deep/bar.json'));

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
      await write('{ "foo": "bar", }', helper.hostPackagePath('foo.json'));

      await current.fix();

      const actual = await read(helper.hostPackagePath('foo.json'));

      expect(actual).toBe('{ "foo": "bar" }');
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
  });
});
