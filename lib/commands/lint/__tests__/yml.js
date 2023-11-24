import helper from '../../../helper.js';
import lint from '../index.js';
import current from '../yml.js';
import read from 'firost/read.js';
import write from 'firost/write.js';
import emptyDir from 'firost/emptyDir.js';

describe('lint-yml', () => {
  const tmpDirectory = './tmp/lint/yml';
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    it('should get yml and yaml', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));
      await write('foo: bar', helper.hostPath('deep/foo.yaml'));
      await write('foo: bar', helper.hostPath('nope.txt'));

      const actual = await current.getInputFiles();

      expect(actual).toContain(helper.hostPath('foo.yml'));
      expect(actual).toContain(helper.hostPath('deep/foo.yaml'));
    });
  });
  describe('run', () => {
    it('should return true if all passes', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      vi.spyOn(current, '__lint');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(current.__lint).not.toHaveBeenCalled();
    });
    it('should throw if a file errors', async () => {
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('bad.yml'));

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
      await write('foo: bar', helper.hostPath('good.yml'));
      await write('foo: ****', helper.hostPath('foo.yml'));
      await write('foo: ****', helper.hostPath('deep/bar.yaml'));

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
      await write('    foo: "bar"', helper.hostPath('foo.yml'));

      await current.fix();

      const actual = await read(helper.hostPath('foo.yml'));

      expect(actual).toBe("foo: 'bar'");
    });
    it('stop early if no file found', async () => {
      vi.spyOn(lint, 'fixWithPrettier');
      const actual = await current.run();

      expect(actual).toBe(true);
      expect(lint.fixWithPrettier).not.toHaveBeenCalled();
    });
  });
});
