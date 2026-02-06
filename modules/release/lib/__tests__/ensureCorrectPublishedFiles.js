import { absolute, copy, firostError, remove, tmpDirectory } from 'firost';
import {
  __,
  ensureCorrectPublishedFiles,
} from '../ensureCorrectPublishedFiles.js';

describe('ensureCorrectPublishedFiles', () => {
  const testDirectory = tmpDirectory(
    'aberlaas/release/ensureCorrectPublishedFiles',
  );

  beforeAll(async () => {
    const fixturePath = absolute('../fixtures/repo/');
    await copy(fixturePath, testDirectory);
  });

  afterAll(async () => {
    await remove(testDirectory);
  });

  describe('ensureCorrectPublishedFiles', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'ensureSameFilesPublishedWithYarnOrNpm').mockImplementation(
        ({ shouldThrow }) => {
          if (!shouldThrow) return;
          throw firostError('BAD_FILES');
        },
      );
    });
    it('should pass if same files on both package managers', async () => {
      const releaseData = {
        allPackages: [
          { shouldThrow: false },
          { shouldThrow: false },
          { shouldThrow: false },
          { shouldThrow: false },
          { shouldThrow: false },
        ],
      };

      const actual = await ensureCorrectPublishedFiles(releaseData);
      expect(actual).toEqual(true);
    });

    it('should pass if same files on both package managers', async () => {
      const releaseData = {
        allPackages: [
          { shouldThrow: false },
          { shouldThrow: false },
          { shouldThrow: true },
          { shouldThrow: false },
          { shouldThrow: false },
        ],
      };

      let actual = null;
      try {
        await ensureCorrectPublishedFiles(releaseData);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'BAD_FILES');
    });
  });

  describe('getNpmPublishedFiles', () => {
    it('should return list of files that npm will publish', async () => {
      const actual = await __.getNpmPublishedFiles({
        filepath: `${testDirectory}/package.json`,
      });

      expect(actual).toEqual([
        'LICENSE',
        'README.md',
        'lib/helpers/env.js',
        'lib/helpers/path.js',
        'lib/main.js',
        'package.json',
        'templates/index.html',
      ]);
    });
  });

  describe('parseNpmPublishOutput', () => {
    it.each([
      [
        {
          title: 'happy path',
          input: dedent`
              {
                "id": "test-package@1.0.0",
                "name": "test-package",
                "files": [
                  {
                    "path": "LICENSE",
                    "size": 0,
                    "mode": 420
                  },
                  {
                    "path": "README.md",
                    "size": 0,
                    "mode": 420
                  },
                  {
                    "path": "lib/helpers/env.js",
                    "size": 0,
                    "mode": 420
                  }
                ]
              }`,

          expected: ['LICENSE', 'README.md', 'lib/helpers/env.js'],
        },
      ],
      [
        {
          title: 'within a workspace, with a top level key',
          input: dedent`
              {
                "aberlaas-ci": {
                  "id": "aberlaas-ci@2.21.1",
                  "name": "aberlaas-ci",
                  "files": [
                    {
                      "path": "LICENSE",
                      "size": 1082,
                      "mode": 420
                    },
                    {
                      "path": "lib/main.js",
                      "size": 2057,
                      "mode": 420
                    },
                    {
                      "path": "package.json",
                      "size": 1156,
                      "mode": 420
                    }
                  ]
                }
              }
              `,

          expected: ['LICENSE', 'lib/main.js', 'package.json'],
        },
      ],
    ])('$title', async ({ input, expected }) => {
      const actual = __.parseNpmPublishOutput(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('getYarnPublishedFiles', () => {
    it('should return list of files that yarn will publish', async () => {
      const actual = await __.getYarnPublishedFiles({
        filepath: `${testDirectory}/package.json`,
      });

      expect(actual).toEqual([
        'LICENSE',
        'README.md',
        'lib/main.js',
        'package.json',
        'templates/index.html',
      ]);
    });
  });

  describe('ensureSameFilesPublishedWithYarnOrNpm', () => {
    it('should not throw when npm and yarn return the same files', async () => {
      vi.spyOn(__, 'getNpmPublishedFiles').mockReturnValue(['README.md']);
      vi.spyOn(__, 'getYarnPublishedFiles').mockReturnValue(['README.md']);

      const actual = await __.ensureSameFilesPublishedWithYarnOrNpm({
        filepath: `${testDirectory}/package.json`,
        content: { name: 'my-package' },
      });

      expect(actual).toEqual(true);
    });

    it('should throw when npm and yarn return different files', async () => {
      vi.spyOn(__, 'getNpmPublishedFiles').mockReturnValue([
        'README.md',
        'templates/index.html',
      ]);
      vi.spyOn(__, 'getYarnPublishedFiles').mockReturnValue([
        'README.md',
        'lib/helpers/path.js',
      ]);

      let actual = null;
      try {
        await __.ensureSameFilesPublishedWithYarnOrNpm({
          filepath: `${testDirectory}/package.json`,
          content: { name: 'my-package' },
        });
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_YARN_DIFFERENT_PUBLISHED_FILES',
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('Only in npm:\n - templates/index.html'),
      );
      expect(actual).toHaveProperty(
        'message',
        expect.stringContaining('Only in yarn:\n - lib/helpers/path.js'),
      );
    });
  });
});
