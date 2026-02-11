import { _ } from 'golgoth';
import {
  absolute,
  emptyDir,
  gitRoot,
  newFile,
  read,
  write,
  writeJson,
} from 'firost';
import { __ as helper, hostGitPath, hostPackagePath } from 'aberlaas-helper';
import { __, fix, run } from '../js.js';

describe('lint/js', () => {
  // IMPORTANT: This test MUST use a directory inside the repository (not /tmp system)
  // because ESLint refuses to lint files outside of its base directory.
  // This is an ESLint technical constraint, not a choice.
  const testDirectory = absolute(gitRoot(), '/tmp/lint/js');
  beforeEach(async () => {
    await emptyDir(testDirectory);

    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${testDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${testDirectory}/lib/src`,
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
        const absolutePath = hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await __.getInputFiles('demo/**/*');
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });
  describe('run', () => {
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', hostPackagePath('bad.js'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
    it('should test all .js files and return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('foo.js'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await run();
      expect(actual).toBe(true);
    });
    it('should throw all error messages of all failed files', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        hostPackagePath('good.js'),
      );
      await write('  const foo = "bar"', hostPackagePath('foo.js'));
      await write('  const foo = "bar"', hostPackagePath('deep/bar.js'));

      let actual = null;
      try {
        await run();
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
      const packageFilepath = hostPackagePath('package.json');
      const binFilepath = hostPackagePath('./bin/foo.js');

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
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_JS');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('  const foo = "bar"; alert(foo)', hostPackagePath('foo.js'));

      await fix();

      const actual = await read(hostPackagePath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });
  });
});
