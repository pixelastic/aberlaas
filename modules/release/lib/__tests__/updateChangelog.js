import { emptyDir, tmpDirectory, write } from 'firost';
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
});
