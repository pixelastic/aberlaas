import { _ } from 'golgoth';
import { newFile, read, remove, tmpDirectory, write } from 'firost';
import { hostGitPath, hostPackagePath, mockHelperPaths } from 'aberlaas-helper';
import { __, fix, run } from '../css.js';

describe('lint/css', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
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
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await __.getInputFiles('theme/**/*');
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });
  describe('run', () => {
    it('should throw if a file errors', async () => {
      await write('body { color: red; }', hostPackagePath('good.css'));
      await write('body{color:       left;}', hostPackagePath('bad.css'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_CSS');
      expect(actual).toHaveProperty('message');
    });
    it('should run on all .css files by default and return true if all passes', async () => {
      await write('body { color: red; }', hostPackagePath('foo.css'));

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('returns true if no file found', async () => {
      const actual = await run();
      expect(actual).toBe(true);
    });
    it('should be able to pass specific files', async () => {
      const goodFilePath = hostPackagePath('good.css');
      const badFilePath = hostPackagePath('bad.css');
      await write('body { color: red; }', goodFilePath);
      await write('body{color:       left;}', badFilePath);

      const actual = await run([goodFilePath]);

      expect(actual).toBe(true);
    });
    it('should throw all error message if a file fails', async () => {
      await write('body { color: red; }', hostPackagePath('good.css'));
      await write('body{color:       red;}', hostPackagePath('bad.css'));
      await write('   body{color:   left;}', hostPackagePath('deep/bad.css'));

      let actual = null;
      try {
        await run();
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
      const configFilepath = hostPackagePath('stylelint.config.js');
      await write(configContent, configFilepath);

      await write('   body{color:   left;}', hostGitPath('deep/bad.css'));

      const actual = await run(null, configFilepath);

      expect(actual).toBe(true);
    });
  });
  describe('fix', () => {
    it('should call prettierFix with the correct files', async () => {
      vi.spyOn(__, 'prettierFix').mockResolvedValue();
      vi.spyOn({ run }, 'run').mockResolvedValue(true);

      await write('body{color: red;}', hostPackagePath('test.css'));

      await fix();

      expect(__.prettierFix).toHaveBeenCalledWith([
        expect.stringContaining('test.css'),
      ]);
    });

    it('should fix files end-to-end', async () => {
      await write('body{color:       red;}', hostPackagePath('style.css'));

      await fix();

      const actual = await read(hostPackagePath('style.css'));

      expect(actual).toBe('body {\n  color: red;\n}');
    });

    it('stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });

    it('should throw if fix works but linting fails', async () => {
      const filepath = hostPackagePath('foo.css');
      await write('body{}', filepath);
      let actual;
      try {
        await fix();
      } catch (error) {
        actual = error;
      }

      const content = await read(filepath);

      expect(content).toBe('body {\n}');
      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_CSS');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected empty block'),
      );
    });
  });
});
