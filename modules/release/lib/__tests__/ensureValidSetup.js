import { emptyDir, tmpDirectory } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __ } from '../ensureValidSetup.js';

describe('ensureValidSetup', () => {
  const testDirectory = tmpDirectory('aberlaas/release/ensureValidSetup');
  let repo;

  describe('ensureCorrectBumpType', () => {
    describe('valid bumpTypes', () => {
      it.each([
        { title: 'patch', input: 'patch' },
        { title: 'minor', input: 'minor' },
        { title: 'major', input: 'major' },
      ])('$title', ({ input }) => {
        const cliArgs = { _: [input] };
        const actual = __.ensureCorrectBumpType(cliArgs);

        expect(actual).toEqual(true);
      });
    });
    describe('invalid bumptypes', () => {
      it.each([
        { title: 'invalid', input: 'invalid' },
        { title: 'undefined', input: undefined },
        { title: 'null', input: null },
        { title: 'empty string', input: '' },
        { title: 'uppercase PATCH', input: 'PATCH' },
        { title: 'misspelled pach', input: 'pach' },
      ])('$title', ({ input }) => {
        const cliArgs = { _: [input] };
        let actual = null;
        try {
          __.ensureCorrectBumpType(cliArgs);
        } catch (err) {
          actual = err;
        }

        expect(actual).not.toEqual(null);
        expect(actual).toHaveProperty(
          'code',
          'ABERLAAS_RELEASE_UNKNOWN_BUMP_TYPE',
        );
        expect(actual.message).toContain('major, minor or patch');
      });
    });
  });

  describe('ensureCorrectBranch', () => {
    beforeEach(async () => {
      vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
      await emptyDir(testDirectory);
      repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
    });
    it('should pass when on main branch', async () => {
      const currentBranch = await repo.currentBranchName();

      const actual = await __.ensureCorrectBranch(repo);

      expect(currentBranch).toEqual('main');
      expect(actual).toEqual(true);
    });

    it('should throw error when not on main branch', async () => {
      await repo.switchBranch('develop');

      let actual = null;
      try {
        await __.ensureCorrectBranch(repo);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NOT_ON_MAIN_BRANCH',
      );
      expect(actual.message).toContain('branch main');
    });
  });
});
