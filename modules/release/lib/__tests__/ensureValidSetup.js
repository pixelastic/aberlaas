import { __ } from '../ensureValidSetup.js';

describe('ensureValidSetup', () => {
  describe('ensureCorrectBumpType', () => {
    describe('valid bumpTypes', () => {
      it.each([
        { title: 'patch', input: 'patch' },
        { title: 'minor', input: 'minor' },
        { title: 'major', input: 'major' },
      ])('$title', ({ input }) => {
        const cliArgs = { _: [input] };
        let actual = null;
        try {
          __.ensureCorrectBumpType(cliArgs);
        } catch (err) {
          actual = err;
        }

        expect(actual).toEqual(null);
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
    it('should pass when on main branch', async () => {
      const mockRepo = {
        currentBranchName: vi.fn().mockReturnValue('main'),
      };

      const result = await __.ensureCorrectBranch(mockRepo);

      expect(result).toEqual(true);
    });

    it('should throw error when not on main branch', async () => {
      const mockRepo = {
        currentBranchName: vi.fn().mockReturnValue('develop'),
      };

      let actual = null;
      try {
        await __.ensureCorrectBranch(mockRepo);
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
