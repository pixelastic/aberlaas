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
    it('should return true if all passes', async () => {
      await write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__run');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__run).not.toHaveBeenCalled();
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
      await write('body { color: red; }', helper.hostPath('foo.css'));

      const actual = await current.run();

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
      vi.spyOn(current, '__prettierFix');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__prettierFix).not.toHaveBeenCalled();
    });
    it('should throw if fix works but linting fails', async () => {
      await write('body{}', helper.hostPath('foo.css'));
      let actual;
      try {
        await current.fix();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ERROR_CSS_LINT');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected empty block'),
      );
    });
  });
});
