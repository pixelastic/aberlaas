import { _ } from 'golgoth';
import { newFile, read, remove, tmpDirectory, write } from 'firost';
import { hostGitPath, hostPackagePath, mockHelperPaths } from 'aberlaas-helper';
import { __, fix, run } from '../html.js';

describe('lint/html', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  beforeEach(async () => {
    mockHelperPaths(testDirectory);
  });
  afterEach(async () => {
    await remove(testDirectory);
  });

  describe('getInputFiles', () => {
    it.each([
      // Default find
      { filepath: 'index.html', expected: true, userPatterns: null },
      { filepath: 'src/index.html', expected: true, userPatterns: null },
      { filepath: 'src/theme/career.html', expected: true, userPatterns: null },
      // Default exclude
      { filepath: 'src/index.txt', expected: false, userPatterns: null },
      { filepath: 'dist/index.html', expected: false, userPatterns: null },
      // Focused folder
      {
        filepath: 'index.html',
        expected: false,
        userPatterns: './src/**/*',
      },
      {
        filepath: 'lib/src/index.html',
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
    it('should always return true', async () => {
      // Note: The run() method isn't implemented as a real linter yet
      const actual = await run();
      expect(actual).toBe(true);
    });
  });

  describe('fix', () => {
    it('should call prettierFix with the correct files', async () => {
      vi.spyOn(__, 'prettierFix').mockResolvedValue();

      await write(
        '<html><body>Test</body></html>',
        hostPackagePath('test.html'),
      );

      await fix();

      expect(__.prettierFix).toHaveBeenCalledWith([
        expect.stringContaining('test.html'),
      ]);
    });

    it('should fix files end-to-end', async () => {
      const filepath = hostPackagePath('index.html');
      await write(
        `<HTML>
<head><title>Test</title></head>
<body>
<h1 class="max-w-container-md bg-red md:max-w-container-xl      hover:bg-blue rounded border-b border-red">title</h1>
<a href="#" class="bg-red hover:bg-blue" data-custom-id="lorem ipsum">link</a>
</body>
</HTML>`,
        filepath,
      );

      await fix();

      const actual = await read(filepath);
      const expected = `<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1
      class="max-w-container-md bg-red md:max-w-container-xl hover:bg-blue border-red rounded border-b">
      title
    </h1>
    <a href="#" class="bg-red hover:bg-blue" data-custom-id="lorem ipsum"
      >link</a
    >
  </body>
</html>`;

      expect(actual).toBe(expected);
    });

    it('should stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });
  });
});
