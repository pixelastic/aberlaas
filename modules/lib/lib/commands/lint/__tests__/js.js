import { absolute, emptyDir, read, write, writeJson } from 'firost';
import { _, pMap } from 'golgoth';
import helper from '../../../helper.js';
import current from '../js.js';

describe('lint-js', () => {
  // Note: tmpDirectory must be a children of ./lib, as ESLint will refuse to
  // lint files outside of its base directory
  const tmpDirectory = absolute('<gitRoot>/lib/tmp/lint/js');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
    await writeJson({}, helper.hostPath('package.json'));
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
        await write('console.log("something");', helper.hostPath(filepath));
      });

      const actual = await current.getInputFiles('./src/**/*');

      _.each(files, (value, filepath) => {
        if (value) {
          expect(actual).toContain(helper.hostPath(filepath));
        } else {
          expect(actual).not.toContain(helper.hostPath(filepath));
        }
      });
    });
  });
  describe('run', () => {
    it('should test all .js files and return true if all passes', async () => {
      await write(
        "const foo = 'bar';\nalert(foo);\n",
        helper.hostPath('foo.js'),
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
        helper.hostPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPath('bad.js'));

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
        helper.hostPath('good.js'),
      );
      await write('  const foo = "bar"', helper.hostPath('foo.js'));
      await write('  const foo = "bar"', helper.hostPath('deep/bar.js'));

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
      const packageFilepath = helper.hostPath('package.json');
      const binFilepath = helper.hostPath('./bin/foo.js');

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
      await write('  const foo = "bar"; alert(foo)', helper.hostPath('foo.js'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.js'));

      expect(actual).toBe("const foo = 'bar';\nalert(foo);");
    });
    it('stop early if no file found', async () => {
      const actual = await current.fix();

      expect(actual).toBe(true);
    });
  });
});
