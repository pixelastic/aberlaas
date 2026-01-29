import { _ } from 'golgoth';
import { newFile, read, remove, tmpDirectory, write } from 'firost';
import {
  __ as helper,
  hostGitPath,
  hostPackagePath,
  mockHelperPaths,
} from 'aberlaas-helper';
import { __, fix, run } from '../circleci.js';

describe('lint-circleci', () => {
  const testDirectory = tmpDirectory('aberlaas/lint/circleci');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
    vi.spyOn(__, 'isRunningOnCircleCi').mockReturnValue(false);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getInputFile', () => {
    describe('from git root', () => {
      beforeEach(() => {
        vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(testDirectory);
      });
      it.each([
        ['.circleci/config.yml', true],
        ['.circleci/config.yaml', false],
        ['.circleci/something-else.yml', false],
        ['circleci.yml', false],
        ['circleci/config.yml', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = hostGitPath(filepath);
        await newFile(absolutePath);

        const actual = await __.getInputFile();
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
    describe('from inside package', () => {
      beforeEach(() => {
        vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(
          `${testDirectory}/lib`,
        );
      });

      it.each([
        ['.circleci/config.yml', false],
        ['.circleci/config.yaml', false],
        ['.circleci/something-else.yml', false],
        ['circleci.yml', false],
        ['circleci/config.yml', false],
      ])('%s : %s', async (filepath, expected) => {
        const absolutePath = hostPackagePath(filepath);
        await newFile(absolutePath);

        const actual = await __.getInputFile();
        const hasFile = _.includes(actual, absolutePath);
        expect(hasFile).toEqual(expected);
      });
    });
  });
  describe('run', () => {
    describe('without circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'hasCircleCiBin').mockReturnValue(false);
      });
      it('should throw if yml is invalid', async () => {
        await write('foo: bar\n bar: baz', hostGitPath('.circleci/config.yml'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('ABERLAAS_LINT_YML');
        expect(actual).toHaveProperty('message');
      });
      it('should return true if file is valid yml', async () => {
        await write('foo: bar', hostGitPath('.circleci/config.yml'));

        const actual = await run();

        expect(actual).toBe(true);
      });
      it('should stop early if no file found', async () => {
        const actual = await run();

        expect(actual).toBe(true);
      });
    });
    describe('with circleci in the path', () => {
      beforeEach(async () => {
        vi.spyOn(__, 'hasCircleCiBin').mockReturnValue(true);
      });
      it('should throw if yml is invalid', async () => {
        await write('foo: bar\n bar: baz', hostGitPath('.circleci/config.yml'));

        let actual = null;
        try {
          await run();
        } catch (error) {
          actual = error;
        }

        expect(actual.code).toBe('ABERLAAS_LINT_YML');
        expect(actual).toHaveProperty('message');
      });
      it('should stop early if no file found', async () => {
        const actual = await run();

        expect(actual).toBe(true);
      });
      it('should throw if config is invalid', async () => {
        vi.spyOn(__, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });
        await write('foo: invalid', hostGitPath('.circleci/config.yml'));

        let actual = null;
        try {
          await run();
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
        vi.spyOn(__, 'validateConfig').mockReturnValue(true);
        await write('foo: valid', hostGitPath('.circleci/config.yml'));

        const actual = await run();

        expect(actual).toBe(true);
      });
      it('should always validate on CircleCI itself', async () => {
        vi.spyOn(__, 'isRunningOnCircleCi').mockReturnValue(true);
        vi.spyOn(__, 'validateConfig').mockImplementation(() => {
          throw new Error('foo bar');
        });

        await write('foo: valid', hostGitPath('.circleci/config.yml'));

        const actual = await run();

        expect(actual).toBe(true);
      });
    });
  });
  describe('fix', () => {
    beforeEach(() => {
      vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(tmpDirectory);
    });
    it('should fix yml issues', async () => {
      vi.spyOn(__, 'validateConfig').mockReturnValue(true);
      await write('    foo: "bar"', hostGitPath('.circleci/config.yml'));

      await fix();

      const actual = await read(hostGitPath('.circleci/config.yml'));

      expect(actual).toBe("foo: 'bar'");
    });
    it('should throw an error if config still invalid', async () => {
      vi.spyOn(__, 'hasCircleCiBin').mockReturnValue(true);
      vi.spyOn(__, 'validateConfig').mockImplementation(() => {
        throw new Error('foo bar');
      });
      await write('    foo: bar', hostGitPath('.circleci/config.yml'));

      let actual;
      try {
        await fix();
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
        await fix();
      } catch (err) {
        actual = err;
      }

      expect(actual).toBeNull();
    });
  });
});
