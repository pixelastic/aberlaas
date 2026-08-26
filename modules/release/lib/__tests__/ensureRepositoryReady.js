import { remove, tmpDirectory } from 'firost';
import { mockHelperPaths } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import { __, ensureRepositoryReady } from '../ensureRepositoryReady.js';

describe('release/ensureRepositoryReady', () => {
  const testDirectory = tmpDirectory(`aberlaas/${describeName}`);
  let repo;

  describe('ensureCorrectBumpType', () => {
    describe('valid bumpTypes', () => {
      it.each([
        { title: 'patch', input: 'patch' },
        { title: 'minor', input: 'minor' },
        { title: 'major', input: 'major' },
        { title: 'undefined', input: undefined },
        { title: 'empty arg', input: [] },
        { title: 'null', input: null },
        { title: 'empty string', input: '' },
      ])('$title', ({ input }) => {
        const cliArgs = { _: [input] };
        const actual = __.ensureCorrectBumpType(cliArgs);

        expect(actual).toEqual(true);
      });
    });

    describe('invalid bumptypes', () => {
      it.each([
        { title: 'invalid', input: 'invalid' },
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

  describe('with real git repo', () => {
    beforeEach(async () => {
      mockHelperPaths(testDirectory);

      repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
    });
    afterEach(async () => {
      await remove(testDirectory);
    });
    describe('ensureCorrectBranch', () => {
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

    describe('ensureCleanRepository', () => {
      it('should pass when repository is clean', async () => {
        const result = await __.ensureCleanRepository(repo);

        expect(result).toEqual(true);
      });

      it('should throw error when repository has uncommitted changes', async () => {
        await repo.newFile('docs/index.md');

        let actual = null;
        try {
          await __.ensureCleanRepository(repo);
        } catch (err) {
          actual = err;
        }

        expect(actual).toHaveProperty(
          'code',
          'ABERLAAS_RELEASE_NOT_CLEAN_DIRECTORY',
        );
      });
    });
  });

  describe('ensureRepositoryReady', () => {
    beforeEach(() => {
      vi.spyOn(__, 'ensureCorrectBumpType').mockReturnValue(true);
      vi.spyOn(__, 'ensureCorrectBranch').mockReturnValue(true);
      vi.spyOn(__, 'ensureCleanRepository').mockReturnValue(true);
    });

    it('should call all validation methods', async () => {
      const cliArgs = { _: ['patch'] };

      await ensureRepositoryReady(cliArgs);

      expect(__.ensureCorrectBumpType).toHaveBeenCalled();
      expect(__.ensureCorrectBranch).toHaveBeenCalled();
      expect(__.ensureCleanRepository).toHaveBeenCalled();
    });
  });
});
