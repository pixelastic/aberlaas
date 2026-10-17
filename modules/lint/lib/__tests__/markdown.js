import { _ } from 'golgoth';
import { absolute, gitRoot, newFile, read, remove, write } from 'firost';
import { hostGitPath, mockHelperPaths } from 'aberlaas-helper';
import { __, fix, run } from '../markdown.js';

describe('lint/markdown', () => {
  // IMPORTANT: This test MUST use a directory inside the repository (not /tmp system)
  // because ESLint refuses to lint files outside of its base directory.
  const testDirectory = absolute(gitRoot(), 'tmp/lint/markdown');
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });
  describe('getInputFiles', () => {
    it.each([
      // Default find
      { filepath: 'README.md', expected: true, userPatterns: null },
      { filepath: 'guides/guide.md', expected: true, userPatterns: null },
      {
        filepath: 'src/deep/nested/note.md',
        expected: true,
        userPatterns: null,
      },
      // Default exclude
      { filepath: 'src/index.js', expected: false, userPatterns: null },
      { filepath: 'notes.txt', expected: false, userPatterns: null },
      // Focused folder
      {
        filepath: 'README.md',
        expected: false,
        userPatterns: './guides/**/*',
      },
      {
        filepath: 'guides/guide.md',
        expected: true,
        userPatterns: './guides/**/*',
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
    it.each([
      {
        title: 'valid Markdown file',
        filepath: 'good.md',
        input: '# Title\n\nSome text.\n',
      },
      {
        title: 'file with YAML front matter',
        filepath: 'post.md',
        input: '---\ntitle: Hello\ntags: [a, b]\n---\n\nSome text.\n',
      },
    ])('should pass on a $title', async ({ filepath, input }) => {
      await write(input, hostGitPath(filepath));

      const actual = await run();

      expect(actual).toBe(true);
    });
    it('should stop early if no file found', async () => {
      const actual = await run();

      expect(actual).toBe(true);
    });
    it('should throw with file and rule in the message on an invalid file', async () => {
      await write('# Title\n\n### Skipped level\n', hostGitPath('bad.md'));

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_MARKDOWN');
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('bad.md'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('markdown/heading-increment'),
      );
    });
  });
  describe('fix', () => {
    it('should wrap long prose at 80 columns', async () => {
      const filepath = hostGitPath('long.md');
      const sentence = 'The quick brown fox jumps over the lazy dog. ';
      await write(`# Title\n\n${sentence.repeat(5)}\n`, filepath);

      await fix();

      const actual = await read(filepath);
      const longestLine = _.chain(actual)
        .split('\n')
        .map('length')
        .max()
        .value();
      expect(longestLine).toBeLessThanOrEqual(80);
      expect(_.replace(actual, /\s+/g, ' ')).toEqual(
        _.trimEnd(`# Title ${sentence.repeat(5)}`),
      );
    });
    it('should keep front matter, code fences, tables and inline code intact', async () => {
      const filepath = hostGitPath('post.md');
      const input = [
        '---',
        'title: Hello',
        'tags:',
        '  - a',
        '  - b',
        '---',
        '',
        'Some `inline code that is quite long and must never be wrapped even when it goes past the limit` text.',
        '',
        '```js',
        'const veryLongLine = "this line inside a code fence is much longer than eighty columns and stays";',
        '```',
        '',
        '| Name | Value |',
        '| ---- | ----- |',
        '| a    | 1     |',
        '',
      ].join('\n');
      await write(input, filepath);

      await fix();

      const actual = await read(filepath);
      expect(actual).toContain('---\ntitle: Hello\ntags:\n  - a\n  - b\n---\n');
      expect(actual).toContain(
        'const veryLongLine = "this line inside a code fence is much longer than eighty columns and stays";',
      );
      expect(actual).toContain(
        '| Name | Value |\n| ---- | ----- |\n| a    | 1     |',
      );
      expect(actual).toContain(
        '`inline code that is quite long and must never be wrapped even when it goes past the limit`',
      );
    });
    it.each([
      {
        title: 'no-missing-atx-heading-space',
        input: '# Title\n\n##Subtitle\n',
        expected: '# Title\n\n## Subtitle',
      },
      {
        title: 'no-reversed-media-syntax',
        input: '# Title\n\n(Alt text)[image.png]\n',
        expected: '# Title\n\n[Alt text](image.png)',
      },
      {
        title: 'no-reference-like-urls',
        input: '# Title\n\n[Link](foo)\n\n[foo]: https://example.com\n',
        expected: '# Title\n\n[Link][foo]\n\n[foo]: https://example.com',
      },
      {
        title: 'no-space-in-emphasis',
        input: '# Title\n\nSome ** bold ** text.\n',
        expected: '# Title\n\nSome **bold** text.',
      },
    ])('should fix $title', async ({ input, expected }) => {
      const filepath = hostGitPath('fixable.md');
      await write(input, filepath);

      await fix();

      const actual = await read(filepath);
      expect(actual).toEqual(expected);
    });
    it('should rewrap the line after removing the spaces inside a bold', async () => {
      // "** bold **" is not bold in CommonMark, ESLint removes the spaces to
      // match what the author meant. That shortens the line, so Prettier must
      // run again afterwards to rewrap it.
      const filepath = hostGitPath('bold.md');
      await write(
        '# Title\n\nAaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee ffffffffff ** gggggggg ** h iiiiiiiiii\n',
        filepath,
      );

      await fix();

      const actual = await read(filepath);
      expect(actual).toEqual(
        '# Title\n\nAaaaaaaaaa bbbbbbbbbb cccccccccc dddddddddd eeeeeeeeee ffffffffff **gggggggg** h\niiiiiiiiii',
      );
    });
    it('should leave the file unchanged on a second run', async () => {
      const filepath = hostGitPath('twice.md');
      await write(
        '---\ntitle: Hello\n---\n\n##Subtitle\n\nSome ** bold ** text that is long enough to be wrapped by Prettier because it goes past the limit.\n\n```js\nconst a = 1;\n```\n\n| Name | Value |\n| ---- | ----- |\n| a    | 1     |\n',
        filepath,
      );

      await fix();
      const afterFirst = await read(filepath);
      await fix();
      const afterSecond = await read(filepath);

      expect(afterSecond).toEqual(afterFirst);
    });
    it('should stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });
    it('should throw if still errors', async () => {
      await write('# Title\n\n### Skipped level\n', hostGitPath('bad.md'));

      let actual = null;
      try {
        await fix();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_LINT_MARKDOWN_FIX');
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('markdown/heading-increment'),
      );
    });
  });
});
