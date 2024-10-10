import { absolute, emptyDir, read, write } from 'firost';
import helper from 'aberlaas-helper';
import current from '../yml.js';

describe('lint-yml', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/yml');
  beforeEach(async () => {
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });
  describe('getInputFiles', () => {
    describe('src/**/*', () => {
      it.each([
        ['src/config.yml', true],
        ['src/tool/settings.yaml', true],
        ['dist/config.yml', false],
        ['src-backup/config.yml', false],
        ['src/config.txt', false],
      ])('%s : %s', async (filepath, shouldBeIncluded) => {
        const absolutePath = helper.hostPath(filepath);
        await write('something', absolutePath);

        const actual = await current.getInputFiles('src/**/*');

        if (shouldBeIncluded) {
          expect(actual).toContain(absolutePath);
        } else {
          expect(actual).not.toContain(absolutePath);
        }
      });
    });
  });

  describe('run', () => {
    it('should run on all yml files and return true if all passes', async () => {
      await write('foo: bar', helper.hostPath('foo.yml'));
      await write('foo: bar', helper.hostPath('foo.yaml'));

      const actual = await current.run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await current.run();

      expect(actual).toBe(true);
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
      const actual = await current.run();

      expect(actual).toBe(true);
    });
  });
});
