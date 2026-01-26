import { emptyDir, firostError, tmpDirectory } from 'firost';
import { __ as helper } from 'aberlaas-helper';
import Gilmore from 'gilmore';
import aberlaasTest from 'aberlaas-test';
import aberlaasLint from 'aberlaas-lint';
import { __, ensureValidSetup } from '../ensureValidSetup.js';

describe('ensureValidSetup', () => {
  const testDirectory = tmpDirectory('aberlaas/release/ensureValidSetup');
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
      vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
      await emptyDir(testDirectory);

      repo = new Gilmore(testDirectory);
      await repo.init();
      await repo.newFile('README.md');
      await repo.commitAll('Initial commit');
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

  describe('ensureTestsArePassing', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(aberlaasTest, 'run').mockReturnValue();
    });

    it('should return false when skip-test is true', async () => {
      const actual = await __.ensureTestsArePassing({ 'skip-test': true });

      expect(actual).toEqual(false);
      expect(aberlaasTest.run).not.toHaveBeenCalled();
    });

    it('should pass when tests succeed', async () => {
      const actual = await __.ensureTestsArePassing();

      expect(actual).toEqual(true);
      expect(__.consoleInfo).toHaveBeenCalled();
      expect(aberlaasTest.run).toHaveBeenCalledWith({ failFast: true });
    });

    it('should throw error when tests fail', async () => {
      vi.spyOn(aberlaasTest, 'run').mockImplementation(() => {
        throw firostError('ABERLAAS_TEST_FAIL', 'Tests are failing');
      });

      let actual = null;
      try {
        await __.ensureTestsArePassing();
      } catch (err) {
        actual = err;
      }

      expect(__.consoleInfo).toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_TESTS_FAILING');
    });
  });

  describe('ensureLintIsPassing', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(aberlaasLint, 'run').mockReturnValue();
    });

    it('should return false when skip-lint is true', async () => {
      const actual = await __.ensureLintIsPassing({ 'skip-lint': true });

      expect(actual).toEqual(false);
      expect(aberlaasLint.run).not.toHaveBeenCalled();
    });

    it('should pass when lint succeeds', async () => {
      const actual = await __.ensureLintIsPassing();

      expect(actual).toEqual(true);
      expect(__.consoleInfo).toHaveBeenCalled();
      expect(aberlaasLint.run).toHaveBeenCalled();
    });

    it('should throw error when lint fails', async () => {
      vi.spyOn(aberlaasLint, 'run').mockImplementation(() => {
        throw firostError('ABERLAAS_LINT_FAIL', 'Lint is failing');
      });

      let actual = null;
      try {
        await __.ensureLintIsPassing();
      } catch (err) {
        actual = err;
      }

      expect(__.consoleInfo).toHaveBeenCalled();
      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_LINT_FAILING');
    });
  });

  describe('ensureValidSetup', () => {
    beforeEach(() => {
      vi.spyOn(__, 'ensureCorrectBumpType').mockReturnValue(true);
      vi.spyOn(__, 'ensureCorrectBranch').mockReturnValue(true);
      vi.spyOn(__, 'ensureCleanRepository').mockReturnValue(true);
      vi.spyOn(__, 'ensureTestsArePassing').mockReturnValue(true);
      vi.spyOn(__, 'ensureLintIsPassing').mockReturnValue(true);
      vi.spyOn(__, 'ensureNpmLogin').mockReturnValue();
    });

    it('should call all validation methods', async () => {
      const cliArgs = { _: ['patch'] };

      await ensureValidSetup(cliArgs);

      expect(__.ensureCorrectBumpType).toHaveBeenCalled();
      expect(__.ensureCorrectBranch).toHaveBeenCalled();
      expect(__.ensureCleanRepository).toHaveBeenCalled();
      expect(__.ensureNpmLogin).toHaveBeenCalled();
      expect(__.ensureTestsArePassing).toHaveBeenCalled();
      expect(__.ensureLintIsPassing).toHaveBeenCalled();
    });

    it('should stop execution when a validation fails', async () => {
      const cliArgs = { _: ['patch'] };
      vi.spyOn(__, 'ensureNpmLogin').mockImplementation(() => {
        throw firostError('BAD_NPM', 'Bad npm');
      });

      let actual = null;
      try {
        await ensureValidSetup(cliArgs);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'BAD_NPM');
      expect(__.ensureCorrectBumpType).toHaveBeenCalled();
      expect(__.ensureCorrectBranch).toHaveBeenCalled();
      expect(__.ensureCleanRepository).toHaveBeenCalled();
      expect(__.ensureNpmLogin).toHaveBeenCalled();
      expect(__.ensureTestsArePassing).not.toHaveBeenCalled();
      expect(__.ensureLintIsPassing).not.toHaveBeenCalled();
    });
  });
});
