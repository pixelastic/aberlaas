import { absolute, emptyDir, newFile, read, write, writeJson } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { _ } from 'golgoth';
import current from '../js.js';

describe('lint-js', () => {
  // Note: tmpDirectory must be a children of the package that loads ESLint
  // as ESLint will refuse to lint files outside of its base directory
  const tmpDirectory = absolute('<gitRoot>/modules/lib/tmp/lint/js');
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
    describe('demo/**/*', () => {
      it.each([
        ['script.js', false],
        ['lib/script.js', false],
        ['lib/src/script.js', false],

        ['lib/demo/script.js', true],
        ['lib/demo/subdir/script.js', true],

        ['lib/demo/script.txt', false],
        ['lib/demo-backup/script.js', false],
        ['lib/demo/dist/script.js', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFiles('demo/**/*');
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });
  describe('run', () => {
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPackagePath('bad.js'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
    it('should test all .js files and return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPackagePath('foo.js'),
      );

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
    it('should throw all error messages of all failed files', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPackagePath('foo.js'));
      await write('  const foo = "bar"', helper.hostPackagePath('deep/bar.js'));

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
    it('should lint files defined in .bin key in package.json', async () => {
      const packageFilepath = helper.hostPackagePath('package.json');
      const binFilepath = helper.hostPackagePath('./bin/foo.js');

      await writeJson(
        {
          bin: {
            foo: './bin/foo.js',
          },
        },
        packageFilepath,
      );
      await write('#!/usr/bin/env node\nconst foo = "bar"', binFilepath);

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write(
        '  const foo = "bar"; alert(foo)',
        helper.hostPackagePath('foo.js'),
      );

      await current.fix();

      const actual = await read(helper.hostPackagePath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      const actual = await current.fix();

      expect(actual).toBe(true);
    });
  });
});
