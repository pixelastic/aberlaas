import { _ } from 'golgoth';
import { absolute, gitRoot, newFile, remove, write } from 'firost';
import { hostGitPath, mockHelperPaths } from 'aberlaas-helper';
import { __, run } from '../markdown.js';

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
});
