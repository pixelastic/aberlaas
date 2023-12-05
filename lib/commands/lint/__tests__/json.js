import helper from '../../../helper.js';
import current from '../json.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import emptyDir from 'firost/emptyDir.js';
import _ from 'golgoth/lodash.js';
import pMap from 'golgoth/pMap.js';

describe('lint-json', () => {
  const tmpDirectory = './tmp/lint/json';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should lint all json files', async () => {
      const files = {
        'src/config.json': true,
        'src/tool/settings.json': true,
        'dist/config.json': false,
        'src-backup/config.json': false,
        'src/config.txt': false,
      };

      await pMap(_.keys(files), async (filepath) => {
        await write('foo', helper.hostPath(filepath));
      });

      const actual = await current.getInputFiles('src/**/*');

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
      await write('{ "foo": "bar" }', helper.hostPath('foo.json'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__parse');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__parse).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('bad.json'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('JsonLintError');
      expect(actual).toHaveProperty('message');
    });
    it('should throw all error message if a file fails', async () => {
      await write('{ "foo": "bar" }', helper.hostPath('good.json'));
      await write('{ "foo": bar }', helper.hostPath('foo.json'));
      await write('{ "foo": bar }', helper.hostPath('deep/bar.json'));

      let actual = null;
      try {
        await current.run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('foo.json'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('deep/bar.json'),
      );
    });
  });
  describe('fix', () => {
    it('should fix files', async () => {
      await write('{ "foo": "bar", }', helper.hostPath('foo.json'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.json'));

      expect(actual).toBe('{ "foo": "bar" }');
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__prettierFix');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__prettierFix).not.toHaveBeenCalled();
    });
  });
});
