import helper from '../../../helper.js';
import current from '../css.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import emptyDir from 'firost/emptyDir.js';
import _ from 'golgoth/lodash.js';
import pMap from 'golgoth/pMap.js';

describe('lint-css', () => {
  const tmpDirectory = './tmp/lint/css';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get css files', async () => {
      const files = {
        'src/index.css': true,
        'src/theme/index.css': true,
        'dist/style.css': false,
        'src-backup/style.css': false,
        'src/nope.txt': false,
      };

      await pMap(_.keys(files), async (filepath) => {
        await write('foo: bar', helper.hostPath(filepath));
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
    it('should run on all .css files by default and return true if all passes', async () => {
      await write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('returns true if no file found', async () => {
      const actual = await current.run();
      expect(actual).toBe(true);
    });
    it('should be able to pass specific files', async () => {
      const goodFilePath = helper.hostPath('good.css');
      const badFilePath = helper.hostPath('bad.css');
      await write('body { color: red; }', goodFilePath);
      await write('body{color:       red;}', badFilePath);

      const actual = await current.run([goodFilePath]);

      expect(actual).toBe(true);
    });
    it('should throw if a file errors', async () => {
      await write('body { color: red; }', helper.hostPath('good.css'));
      await write('body{color:       red;}', helper.hostPath('bad.css'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ERROR_CSS_LINT');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('body { color: red; }', helper.hostPath('good.css'));
      await write('body{color:       red;}', helper.hostPath('bad.css'));
      await write('   body{color:   red;}', helper.hostPath('deep/bad.css'));

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
      const configFilepath = helper.hostPath('stylelint.config.js');
      await write(configContent, configFilepath);

      await write('   body{color:   red;}', helper.hostPath('deep/bad.css'));

      const actual = await current.run(null, configFilepath);

      expect(actual).toBe(true);
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('body{color:       red;}', helper.hostPath('style.css'));

      await current.fix();

      const actual = await read(helper.hostPath('style.css'));

      expect(actual).toBe('body {\n  color: red;\n}');
    });
    it('stop early if no file found', async () => {
      const actual = await current.fix();

      expect(actual).toBe(true);
    });
    it('should throw if fix works but linting fails', async () => {
      const filepath = helper.hostPath('foo.css');
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
