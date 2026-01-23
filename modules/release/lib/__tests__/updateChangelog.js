import { Readable } from 'node:stream';
import { captureOutput, emptyDir, read, tmpDirectory, write } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import { _ } from 'golgoth';
import Gilmore from 'gilmore';
import { __ } from '../updateChangelog.js';

describe('updateChangelog', () => {
  const testDirectory = tmpDirectory('aberlaas/release/updateChangelog');
  let repo;

  beforeEach(async () => {
    await emptyDir(testDirectory);
    vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);

    repo = new Gilmore(testDirectory);
    await repo.init();
  });

  describe('generateChangelogFromGit', () => {
    it('should generate changelog with feat/fix/perf commits and filter others', async () => {
      await repo.newFile('README.md');
      await repo.commitAll('chore: initial commit');
      await repo.createTag('v1.0.0');

      await write('Feature content', `${testDirectory}/feature.txt`);
      await repo.commitAll('feat: add new feature');

      await write('Fix content', `${testDirectory}/fix.txt`);
      await repo.commitAll('fix: correct a bug');

      await write('Perf content', `${testDirectory}/perf.txt`);
      await repo.commitAll('perf: improve performance');

      await write('Test content', `${testDirectory}/test.txt`);
      await repo.commitAll('test: add tests');

      await write('Chore content', `${testDirectory}/chore.txt`);
      await repo.commitAll('chore: update dependencies');

      // Generate changelog
      const rawChangelog = await __.generateChangelogFromGit('1.0.0', '1.1.0');

      // Normalize: replace commit SHAs with placeholder
      const actual = _.replace(rawChangelog, /\([0-9a-f]{7}\)/g, '(SHA)');

      const expected = dedent`
          ## v1.1.0


          ### Features

          - Add new feature (SHA)

          ### Bug Fixes

          - Correct a bug (SHA)

          ### Performance

          - Improve performance (SHA)`;

      expect(actual).toEqual(expected);
    });
  });

  describe('confirmOrEditChangelog', () => {
    let mockStdin;

    beforeEach(() => {
      mockStdin = new Readable({ read() {} });
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'consoleLog').mockReturnValue();
      vi.spyOn(__, 'cliMarkdown').mockImplementation((input) => {
        return `Markdown: ${input}`;
      });
    });

    it('should display changelog with markdown formatting and separators', async () => {
      const changelog = 'Changelog';

      await captureOutput(async () => {
        vi.spyOn(__, 'select').mockReturnValue('approve');

        await __.confirmOrEditChangelog(changelog);

        expect(__.consoleInfo).toHaveBeenCalledWith('CHANGELOG:');
        expect(__.consoleLog).toHaveBeenCalledWith('━'.repeat(60));
        expect(__.consoleLog).toHaveBeenCalledWith(`Markdown: ${changelog}`);
      });
    });

    it('should return changelog when user approves', async () => {
      const changelog = 'Changelog';

      await captureOutput(async () => {
        const promise = __.confirmOrEditChangelog(changelog, {
          input: mockStdin,
        });

        mockStdin.push('\n'); // Enter
        const actual = await promise;

        await expect(actual).toEqual(changelog);
      });
    });

    it('should handle the edit action', async () => {
      vi.spyOn(__, 'select')
        .mockReturnValueOnce('edit') // First we edit,
        .mockReturnValueOnce('approve'); // then we approve
      const expectedChangelogFile = `${testDirectory}/tmp/CHANGELOG.md`;

      // We make the "run" command save the content of the tmp changelog, and
      // write a new one to the file
      let changelogFileContentBefore = null;
      vi.spyOn(__, 'run').mockImplementation(async () => {
        changelogFileContentBefore = await read(expectedChangelogFile);
        await write('Edited changelog', expectedChangelogFile);
      });

      await captureOutput(async () => {
        // Appel de la fonction
        const actual = await __.confirmOrEditChangelog('Original changelog');

        expect(actual).toEqual('Edited changelog');
        expect(changelogFileContentBefore).toEqual('Original changelog');
        expect(__.run).toHaveBeenCalledWith(
          `$EDITOR ${expectedChangelogFile}`,
          {
            stdin: true,
            shell: true,
          },
        );
      });
    });

    it('should throw error when user cancels', async () => {
      const changelog = 'Changelog';
      vi.spyOn(__, 'select').mockReturnValue('cancel');

      await captureOutput(async () => {
        let actual = null;
        try {
          await __.confirmOrEditChangelog(changelog);
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty(
          'code',
          'ABERLAAS_RELEASE_CHANGELOG_CANCELLED',
        );
      });
    });

    it('should throw error on Ctrl-C', async () => {
      const changelog = 'Changelog';

      await captureOutput(async () => {
        let actual = null;
        try {
          const promise = __.confirmOrEditChangelog(changelog, {
            input: mockStdin,
          });

          mockStdin.push(''); // Ctrl-C

          await promise;
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty('code', 'FIROST_SELECT_CTRL_C');
      });
    });
  });
});
