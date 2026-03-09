import { _ } from 'golgoth';
import {
  absolute,
  gitRoot,
  newFile,
  read,
  remove,
  write,
  writeJson,
} from 'firost';
import { hostGitPath, hostPackagePath, mockHelperPaths } from 'aberlaas-helper';
import { __, fix, run } from '../json.js';

describe('lint/json', () => {
  // IMPORTANT: This test MUST use a directory inside the repository (not /tmp system)
  // because ESLint refuses to lint files outside of its base directory.
  // This is an ESLint technical constraint, not a choice.
  const testDirectory = absolute(gitRoot(), 'tmp/lint/json');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });
  describe('getInputFiles', () => {
    it.each([
      // Default find
      { filepath: 'package.json', expected: true, userPatterns: null },
      { filepath: 'data/config.json', expected: true, userPatterns: null },
      {
        filepath: 'src/config/api.json',
        expected: true,
        userPatterns: null,
      },
      // Default exclude
      { filepath: 'src/index.jsonl', expected: false, userPatterns: null },
      { filepath: 'dist/script.json', expected: false, userPatterns: null },
      // Focused folder
      {
        filepath: 'package.json',
        expected: false,
        userPatterns: './data/**/*',
      },
      {
        filepath: 'lib/src/debug.json',
        expected: false,
        userPatterns: './src/**/*',
      },
    ])('$filepath', async ({ filepath, expected, userPatterns }) => {
      const absolutePath = hostGitPath(filepath);
      await newFile(absolutePath);

      const actual = await __.getInputFiles(userPatterns);
      const hasFile = _.includes(actual, absolutePath);
      expect(hasFile).toEqual(expected);
    });
  });
  describe('run', () => {
    it('should throw if a file errors', async () => {
      await writeJson({ foo: 'bar' }, hostPackagePath('good.json'));
      await write('{ "foo": bar }', hostPackagePath('bad.json'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual.code).toBe('ABERLAAS_LINT_JSON');
      expect(actual).toHaveProperty('message');
    });
    it('should run on all .json files and return true if all passes', async () => {
      await writeJson({ foo: 'bar' }, hostPackagePath('foo.json'));

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('stop early if no file found', async () => {
      const actual = await run();

      expect(actual).toBe(true);
    });
    it('should throw all error message if a file fails', async () => {
      await writeJson({ foo: 'bar' }, hostPackagePath('good.json'));
      await write('{ "foo": bar }', hostPackagePath('foo.json'));
      await write('{ "foo": bar }', hostPackagePath('deep/bar.json'));

      let actual = null;
      try {
        await run();
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
    it('stop early if no file found', async () => {
      const actual = await run();
      expect(actual).toBe(true);
    });

    it('should fix trailing comma', async () => {
      await write('{ "foo": "bar", }', hostPackagePath('foo.json'));

      await fix();

      const actual = await read(hostPackagePath('foo.json'));

      expect(actual).toBe('{ "foo": "bar" }');
    });

    it('should throw if still errors', async () => {
      await write(
        '{ "foo": "bar", "foo": "baz" }',
        hostPackagePath('foo.json'),
      );

      let actual = null;
      try {
        await fix();
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_JSON_FIX');
    });
  });
});
