import { absolute, emptyDir, read, write } from 'firost';
import { _, pMap } from 'golgoth';
import helper from '../../../helper.js';
import current from '../circleci.js';

describe('lint-circleci', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/circleci');
  beforeEach(async () => {
    vi.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(false);
    vi.spyOn(helper, 'hostRoot').mockReturnValue(tmpDirectory);
    await emptyDir(tmpDirectory);
  });

  describe('getInputFiles', () => {
    it('should only get .circleci/config.yml', async () => {
      const files = {
        '.circleci/config.yml': true,
        '.circleci/something-else.yml': false,
        'circleci.yml': false,
        'src/.circleci/config.yml': false,
      };

      await pMap(_.keys(files), async (filepath) => {
        await write('foo: bar', helper.hostPath(filepath));
      });

      const actual = await current.getInputFiles();

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
    describe('without circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(false);
      });
      it('should return true if file is valid yml', async () => {
        await write('foo: bar', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml'),
        );

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
    });
    describe('with circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostPath('.circleci/config.yml'),
        );

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('YamlLintError');
        expect(actual).toHaveProperty('message');
      });
      it('should throw if config is invalid', async () => {
        vi.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });
        await write('foo: invalid', helper.hostPath('.circleci/config.yml'));

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('CircleCiLintError');
        expect(actual).toHaveProperty(
          'message',
          expect.stringMatching('foo bar'),
        );
      });
      it('should return true if file is valid yml and valid config', async () => {
        vi.spyOn(current, 'validateConfig').mockReturnValue(true);
        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should always validate on CircleCI itself', async () => {
        vi.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(true);
        vi.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });

        await write('foo: valid', helper.hostPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
    });
  });
  describe('fix', () => {
    it('should fix yml issues', async () => {
      vi.spyOn(current, 'validateConfig').mockReturnValue(true);
      await write('    foo: "bar"', helper.hostPath('.circleci/config.yml'));

      await current.fix();

      const actual = await read(helper.hostPath('.circleci/config.yml'));

      expect(actual).toBe("foo: 'bar'");
    });
    it('should throw an error if config still invalid', async () => {
      vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(true);
      vi.spyOn(current, 'validateConfig').mockImplementation(() => {
        throw new Error('foo bar');
      });
      await write('    foo: bar', helper.hostPath('.circleci/config.yml'));

      let actual;
      try {
        await current.fix();
      } catch (err) {
        actual = err;
      }

      expect(actual.code).toBe('CircleCiLintError');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('foo bar'),
      );
    });
    it('should do nothing if no file', async () => {
      let actual = null;
      try {
        await current.fix();
      } catch (err) {
        actual = err;
      }

      expect(actual).toBeNull();
    });
  });
});
