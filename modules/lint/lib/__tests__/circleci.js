import { absolute, emptyDir, newFile, read, write } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { _ } from 'golgoth';
import current from '../circleci.js';

describe('lint-circleci', () => {
  const tmpDirectory = absolute('<gitRoot>/tmp/lint/circleci');
  beforeEach(async () => {
    await emptyDir(tmpDirectory);
    vi.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(false);

    // We mock them all so a bug doesn't just wipe our real aberlaas repo
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(tmpDirectory);
    vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${tmpDirectory}/lib`);
    vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
      `${tmpDirectory}/lib/src`,
    );
  });

  describe('getInputFile', () => {
    describe('from git root', () => {
      beforeEach(() => {
        vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(tmpDirectory);
      });
      it.each([
        ['.circleci/config.yml', true],
        ['.circleci/config.yaml', false],
        ['.circleci/something-else.yml', false],
        ['circleci.yml', false],
        ['circleci/config.yml', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFile();
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
    describe('from inside package', () => {
      beforeEach(() => {
        vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(
          `${tmpDirectory}/lib`,
        );
      });

      it.each([
        ['.circleci/config.yml', false],
        ['.circleci/config.yaml', false],
        ['.circleci/something-else.yml', false],
        ['circleci.yml', false],
        ['circleci/config.yml', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = helper.hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await current.getInputFile();
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(tmpDirectory);
    });

    describe('without circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(false);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostGitPath('.circleci/config.yml'),
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
      it('should return true if file is valid yml', async () => {
        await write('foo: bar', helper.hostGitPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
    });
    describe('with circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(true);
      });
      it('should throw if yml is invalid', async () => {
        await write(
          'foo: bar\n bar: baz',
          helper.hostGitPath('.circleci/config.yml'),
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
      it('should stop early if no file found', async () => {
        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should throw if config is invalid', async () => {
        vi.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });
        await write('foo: invalid', helper.hostGitPath('.circleci/config.yml'));

        let actual = null;
        try {
          await current.run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('ABERLAAS_LINT_CIRCLECI');
        expect(actual).toHaveProperty(
          'message',
          expect.stringMatching('foo bar'),
        );
      });
      it('should return true if file is valid yml and valid config', async () => {
        vi.spyOn(current, 'validateConfig').mockReturnValue(true);
        await write('foo: valid', helper.hostGitPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
      it('should always validate on CircleCI itself', async () => {
        vi.spyOn(current, 'isRunningOnCircleCi').mockReturnValue(true);
        vi.spyOn(current, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });

        await write('foo: valid', helper.hostGitPath('.circleci/config.yml'));

        const actual = await current.run();

        expect(actual).toBe(true);
      });
    });
  });
  describe('fix', () => {
    beforeEach(() => {
      vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(tmpDirectory);
    });
    it('should fix yml issues', async () => {
      vi.spyOn(current, 'validateConfig').mockReturnValue(true);
      await write('    foo: "bar"', helper.hostGitPath('.circleci/config.yml'));

      await current.fix();

      const actual = await read(helper.hostGitPath('.circleci/config.yml'));

      expect(actual).toBe("foo: 'bar'");
    });
    it('should throw an error if config still invalid', async () => {
      vi.spyOn(current, 'hasCircleCiBin').mockReturnValue(true);
      vi.spyOn(current, 'validateConfig').mockImplementation(() => {
        throw new Error('foo bar');
      });
      await write('    foo: bar', helper.hostGitPath('.circleci/config.yml'));

      let actual;
      try {
        await current.fix();
      } catch (err) {
        actual = err;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_CIRCLECI');
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
