import { _ } from 'golgoth';
import { read, remove, tmpDirectory, write, writeJson } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import { prettierFix } from '../prettierFix.js';

describe('lint/prettierFix', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);

  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });

  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('prettierFix', () => {
    it('should successfully fix valid files', async () => {
      const filepath = `${testDirectory}/good.json`;
      await write('{"foo":"bar",}', filepath);

      await prettierFix([filepath]);

      const actual = await read(filepath);
      expect(actual).toBe('{ "foo": "bar" }');
    });

    it('should collect errors from multiple broken files', async () => {
      const file1 = `${testDirectory}/broken1.json`;
      const file2 = `${testDirectory}/broken2.json`;

      await write('{ invalid }', file1);
      await write('{ also invalid }', file2);

      let actual = null;
      try {
        await prettierFix([file1, file2]);
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_PRETTIER_FIX');
      expect(actual.message).toContain('broken1.json');
      expect(actual.message).toContain('broken2.json');
    });

    it('should fix some files and throw for broken ones', async () => {
      const goodFile = `${testDirectory}/good.json`;
      const brokenFile = `${testDirectory}/broken.json`;

      await write('{"foo":"bar",}', goodFile);
      await write('{ << broken >>', brokenFile);

      let actual = null;
      try {
        await prettierFix([goodFile, brokenFile]);
      } catch (error) {
        actual = error;
      }

      const goodContent = await read(goodFile);
      expect(goodContent).toBe('{ "foo": "bar" }');

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_PRETTIER_FIX');
      expect(actual.message).toContain('broken.json');
      expect(actual.message).not.toContain('good.json');
    });

    it.each([
      {
        title: 'wrap prose in Markdown files',
        filename: 'long.md',
        input: `${'The quick brown fox jumps over the lazy dog. '.repeat(5)}\n`,
        expected: true,
      },
      {
        title: 'not wrap prose in other files',
        filename: 'long.json',
        input: `{"foo":"${'The quick brown fox jumps over the lazy dog. '.repeat(5)}"}`,
        expected: false,
      },
    ])('should $title', async ({ filename, input, expected }) => {
      const filepath = `${testDirectory}/${filename}`;
      await write(input, filepath);

      await prettierFix([filepath]);

      const lines = _.split(await read(filepath), '\n');
      const actual = _.chain(lines).map('length').max().value() <= 80;
      expect(actual).toEqual(expected);
    });
    it.each([
      {
        title: 'apply a host override with a path relative to the config',
        filename: 'docs/long.md',
        expected: true,
      },
      {
        title: 'not apply a host override to files outside its path',
        filename: 'other/long.md',
        expected: false,
      },
    ])('should $title', async ({ filename, expected }) => {
      await writeJson({ type: 'module' }, `${testDirectory}/package.json`);
      await write(
        "export default { printWidth: 80, overrides: [{ files: 'docs/*.md', options: { proseWrap: 'always' } }] };",
        `${testDirectory}/prettier.config.js`,
      );
      const filepath = `${testDirectory}/${filename}`;
      await write(
        `${'The quick brown fox jumps over the lazy dog. '.repeat(5)}\n`,
        filepath,
      );

      await prettierFix([filepath]);

      const lines = _.split(await read(filepath), '\n');
      const actual = _.chain(lines).map('length').max().value() <= 80;
      expect(actual).toEqual(expected);
    });

    describe('ignore files', () => {
      const unformatted = '{"foo":"bar",}';
      const formatted = '{ "foo": "bar" }';

      it.each([
        {
          title: 'leave a file listed in .prettierignore untouched',
          ignoreFile: '.prettierignore',
        },
        {
          title: 'leave a file listed in .gitignore untouched',
          ignoreFile: '.gitignore',
        },
      ])('should $title', async ({ ignoreFile }) => {
        const filepath = `${testDirectory}/ignored.json`;
        await write('ignored.json\n', `${testDirectory}/${ignoreFile}`);
        await write(unformatted, filepath);

        await prettierFix([filepath]);

        const actual = await read(filepath);
        expect(actual).toBe(unformatted);
      });

      it('should format a file that no ignore file lists', async () => {
        const filepath = `${testDirectory}/good.json`;
        await write('other.json\n', `${testDirectory}/.prettierignore`);
        await write('another.json\n', `${testDirectory}/.gitignore`);
        await write(unformatted, filepath);

        await prettierFix([filepath]);

        const actual = await read(filepath);
        expect(actual).toBe(formatted);
      });

      it('should format other files when some files are ignored', async () => {
        const ignoredFile = `${testDirectory}/ignored.json`;
        const goodFile = `${testDirectory}/good.json`;
        await write('ignored.json\n', `${testDirectory}/.prettierignore`);
        await write(unformatted, ignoredFile);
        await write(unformatted, goodFile);

        await prettierFix([ignoredFile, goodFile]);

        const actualIgnored = await read(ignoredFile);
        const actualGood = await read(goodFile);
        expect(actualIgnored).toBe(unformatted);
        expect(actualGood).toBe(formatted);
      });

      it('should not throw when neither ignore file exists', async () => {
        const filepath = `${testDirectory}/good.json`;
        await write(unformatted, filepath);

        await prettierFix([filepath]);

        const actual = await read(filepath);
        expect(actual).toBe(formatted);
      });

      it('should not report an error for an ignored broken file', async () => {
        const filepath = `${testDirectory}/broken.json`;
        await write('broken.json\n', `${testDirectory}/.prettierignore`);
        await write('{ invalid }', filepath);

        let actual = null;
        try {
          await prettierFix([filepath]);
        } catch (error) {
          actual = error;
        }

        expect(actual).toBeNull();
      });
    });
  });
});
