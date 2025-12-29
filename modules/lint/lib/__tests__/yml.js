import { absolute, emptyDir, newFile, read, write } from 'firost';
import helper from 'aberlaas-helper';
import current from '../yml.js';

describe('lint-yml', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/yml');
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
    it('should run on all yml files and return true if all passes', async () => {
      await write('foo: bar', helper.hostPackagePath('foo.yml'));
      await write('foo: bar', helper.hostPackagePath('foo.yaml'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('should throw if a file errors', async () => {
      await write('foo: bar', helper.hostPackagePath('good.yml'));
      await write('foo: ****', helper.hostPackagePath('bad.yml'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('YamlLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('foo: bar', helper.hostPackagePath('good.yml'));
      await write('foo: ****', helper.hostPackagePath('foo.yml'));
      await write('foo: ****', helper.hostPackagePath('deep/bar.yaml'));

      let actual = null;
      try {
        await current.run();
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
    it('should fix files', async () => {
      await write('    foo: "bar"', helper.hostPackagePath('foo.yml'));

      await current.fix();

      const actual = await read(helper.hostPackagePath('foo.yml'));

      expect(actual).toBe("foo: 'bar'");
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
    });
  });
});
