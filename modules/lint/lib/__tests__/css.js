import { absolute, emptyDir, newFile, read, write } from 'firost';
import * as helper from 'aberlaas-helper';
import current from '../css.js';

describe('lint-css', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/css');
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
    describe('theme/**/*', () => {
      it.each([
        ['style.css', false],
        ['lib/style.css', false],
        ['lib/src/style.css', false],

        ['lib/theme/style.css', true],
        ['lib/theme/subdir/style.css', true],

        ['lib/theme/style.txt', false],
        ['lib/theme-backup/style.css', false],
        ['lib/theme/dist/style.css', false],
      ])('%s : %s', async (filepath, shouldBeIncluded) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFiles('theme/**/*');

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
      await write('body { color: red; }', helper.hostPackagePath('good.css'));
      await write(
        'body{color:       left;}',
        helper.hostPackagePath('bad.css'),
      );

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ERROR_CSS_LINT');
      expect(actual).toHaveProperty('message');
    });
    it('should run on all .css files by default and return true if all passes', async () => {
      await write('body { color: red; }', helper.hostPackagePath('foo.css'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('returns true if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
    it('should be able to pass specific files', async () => {
      const goodFilePath = helper.hostPackagePath('good.css');
      const badFilePath = helper.hostPackagePath('bad.css');
      await write('body { color: red; }', goodFilePath);
      await write('body{color:       left;}', badFilePath);

      const actual = await current.run([goodFilePath]);

      expect(actual).toBe(true);
    });
    it('should throw all error message if a file fails', async () => {
      await write('body { color: red; }', helper.hostPackagePath('good.css'));
      await write('body{color:       red;}', helper.hostPackagePath('bad.css'));
      await write(
        '   body{color:   left;}',
        helper.hostPackagePath('deep/bad.css'),
      );

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('bad.css'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bad.css'),
      );
    });
    it('should allow specifying the config file to use', async () => {
      // Custom config
      const configContent = dedent`
      export default {
        rules: {},
      };
      `;
      const configFilepath = helper.hostPackagePath('stylelint.config.js');
      await write(configContent, configFilepath);

      await write(
        '   body{color:   left;}',
        helper.hostGitPath('deep/bad.css'),
      );

      const actual = await current.run(null, configFilepath);

      expect(actual).toBe(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write(
        'body{color:       red;}',
        helper.hostPackagePath('style.css'),
      );

      await current.fix();

      const actual = await read(helper.hostPackagePath('style.css'));

      expect(actual).toBe('body {\n  color: red;\n}');
    });
    it('stop early if no file found', async () => {
      const actual = await current.fix();

      expect(actual).toBe(true);
    });
    it('should throw if fix works but linting fails', async () => {
      const filepath = helper.hostPackagePath('foo.css');
      await write('body{}', filepath);
      let actual;
      try {
        await current.fix();
      } catch (error) {
        actual = error;
      }

      const content = await read(filepath);

      expect(content).toBe('body {\n}');
      expect(actual).toHaveProperty('code', 'ERROR_CSS_LINT');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected empty block'),
      );
    });
  });
});
