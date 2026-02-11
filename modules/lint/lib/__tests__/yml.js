import { _ } from 'golgoth';
import { newFile, read, remove, tmpDirectory, write } from 'firost';
import { hostGitPath, hostPackagePath, mockHelperPaths } from 'aberlaas-helper';
import { __, fix, run } from '../yml.js';

describe('lint/yml', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });
  describe('getInputFiles', () => {
    describe('tools/**/*', () => {
      it.each([
        ['config.yml', false],
        ['lib/config.yml', false],
        ['lib/src/config.yml', false],

        ['lib/tools/config.yml', true],
        ['lib/tools/config.yaml', true],
        ['lib/tools/subdir/config.yml', true],
        ['lib/tools/subdir/config.yaml', true],

        ['lib/tools/config.txt', false],
        ['lib/tools-backup/config.yml', false],
        ['lib/tools/dist/config.yml', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await __.getInputFiles('tools/**/*');
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });

  describe('run', () => {
    it('should run on all yml files and return true if all passes', async () => {
      await write('foo: bar', hostPackagePath('foo.yml'));
      await write('foo: bar', hostPackagePath('foo.yaml'));

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await run();

      expect(actual).toBe(true);
    });
    it('should throw if a file errors', async () => {
      await write('foo: bar', hostPackagePath('good.yml'));
      await write('foo: ****', hostPackagePath('bad.yml'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_YML');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('foo: bar', hostPackagePath('good.yml'));
      await write('foo: ****', hostPackagePath('foo.yml'));
      await write('foo: ****', hostPackagePath('deep/bar.yaml'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.yml'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.yaml'),
      );
    });
  });
  describe('fix', () => {
    it('should call prettierFix with the correct files', async () => {
      vi.spyOn(__, 'prettierFix').mockResolvedValue();

      await write('foo: bar', hostPackagePath('test.yml'));

      await fix();

      expect(__.prettierFix).toHaveBeenCalledWith([
        expect.stringContaining('test.yml'),
      ]);
    });

    it('should fix files end-to-end', async () => {
      await write('    foo: "bar"', hostPackagePath('foo.yml'));

      await fix();

      const actual = await read(hostPackagePath('foo.yml'));

      expect(actual).toBe("foo: 'bar'");
    });

    it('stop early if no file found', async () => {
      const actual = await run();

      expect(actual).toBe(true);
    });
  });
});
