import { absolute, emptyDir, read, write, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import helper from 'aberlaas-helper';
import current from '../js.js';

describe('lint-js', () => {
  // Note: tmpDirectory must be a children of the package that loads ESLint
  // as ESLint will refuse to lint files outside of its base directory
  const tmpDirectory = absolute('<gitRoot>/modules/lib/tmp/lint/js');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    await writeJson({}, helper.hostGitPath('package.json'));
  });
  describe('getInputFiles', () => {
    it('should get js files', async () => {
      const files = {
        'src/script.js': true,
        'src/theme/script.js': true,
        'dist/script.js': false,
        'src-backup/script.js': false,
        'src/script.txt': false,
      };

      await pMap(_.keys(files), async (filepath) => {
        await write('console.log("something");', helper.hostGitPath(filepath));
      });

      const actual = await current.getInputFiles('./src/**/*');

      _.each(files, (value, filepath) => {
        if (value) {
          expect(actual).toContain(helper.hostGitPath(filepath));
        } else {
          expect(actual).not.toContain(helper.hostGitPath(filepath));
        }
      });
    });
  });
  describe('run', () => {
    it('should test all .js files and return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostGitPath('foo.js'),
      );

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
    it('should throw if a file errors', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostGitPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostGitPath('bad.js'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error messages of all failed files', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostGitPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostGitPath('foo.js'));
      await write('  const foo = "bar"', helper.hostGitPath('deep/bar.js'));

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
      const packageFilepath = helper.hostGitPath('package.json');
      const binFilepath = helper.hostGitPath('./bin/foo.js');

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

      expect(actual.code).toBe('JavaScriptLintError');
      expect(actual).toHaveProperty('message');
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write(
        '  const foo = "bar"; alert(foo)',
        helper.hostGitPath('foo.js'),
      );

      await current.fix();

      const actual = await read(helper.hostGitPath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      const actual = await current.fix();

      expect(actual).toBe(true);
    });
  });
});
