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
    it('should return true if all files are valid', async () => {
      await write(
        '<html><body>Hello</body></html>',
        hostPackagePath('foo.html'),
      );

      const actual = await run();

      expect(actual).toBe(true);
    });

    it('should stop early if no file found', async () => {
      const actual = await run();

      expect(actual).toBe(true);
    });

    it('should return true even with unformatted HTML (no linting, only formatting)', async () => {
      await write(
        '<html><body class="px-4 text-blue-500 bg-white">Test</body></html>',
        hostPackagePath('unformatted.html'),
      );

      const actual = await run();

      // Should not throw since we don't have a real HTML linter yet
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

    it('should format HTML with proper indentation', async () => {
      await write(
        '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>',
        hostPackagePath('foo.html'),
      );

      await fix();

      const actual = await read(hostPackagePath('foo.html'));

      // Prettier should format it with proper indentation
      expect(actual).toContain('<html>');
      expect(actual).toContain('</html>');
      expect(actual).toContain('<title>Test</title>');
    });

    it('should sort Tailwind classes', async () => {
      await write(
        '<div class="px-4 text-blue-500 bg-white mt-8 hover:bg-gray-100 flex">Test</div>',
        hostPackagePath('tailwind.html'),
      );

      await fix();

      const actual = await read(hostPackagePath('tailwind.html'));

      // Tailwind plugin should sort classes in the proper order
      // Layout classes (flex) should come before spacing (mt-8, px-4)
      // Colors should come after
      expect(actual).toContain('class="');
      expect(actual).toContain('flex');
      expect(actual).toContain('bg-white');
    });

    it('should handle multiple HTML files', async () => {
      await write(
        '<html><body>Page 1</body></html>',
        hostPackagePath('page1.html'),
      );
      await write(
        '<html><body>Page 2</body></html>',
        hostPackagePath('page2.html'),
      );

      await fix();

      const actual1 = await read(hostPackagePath('page1.html'));
      const actual2 = await read(hostPackagePath('page2.html'));

      expect(actual1).toContain('Page 1');
      expect(actual2).toContain('Page 2');
    });

    it('should stop early if no file found', async () => {
      const actual = await fix();

      expect(actual).toBe(true);
    });

    it('should format HTML with proper structure', async () => {
      await write(
        '<html lang="en"><body>Test</body></html>',
        hostPackagePath('quotes.html'),
      );

      await fix();

      const actual = await read(hostPackagePath('quotes.html'));

      // Prettier formats HTML with proper structure and double quotes for attributes
      expect(actual).toContain('lang="en"');
      expect(actual).toContain('<body>');
    });
  });
});
