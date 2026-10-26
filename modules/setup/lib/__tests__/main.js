import { __, run } from '../main.js';

describe('setup/main', () => {
  describe('run', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'ensureGithubToken').mockReturnValue();
      vi.spyOn(__, 'enableGithub').mockReturnValue();
      vi.spyOn(__, 'enableCircleci').mockReturnValue();
      vi.spyOn(__, 'enableRenovate').mockReturnValue();
    });
    it('should configure github, circleci and renovate by default', async () => {
      await run();
      expect(__.enableGithub).toHaveBeenCalled();
      expect(__.enableCircleci).toHaveBeenCalled();
      expect(__.enableRenovate).toHaveBeenCalled();
    });
    it('should allow disabling services', async () => {
      await run({ circleci: false, renovate: false });
      expect(__.enableCircleci).not.toHaveBeenCalled();
      expect(__.enableRenovate).not.toHaveBeenCalled();
    });
    it('should check the token before enabling any service', async () => {
      await run();
      const tokenOrder = __.ensureGithubToken.mock.invocationCallOrder[0];
      expect(tokenOrder).toBeLessThan(
        __.enableGithub.mock.invocationCallOrder[0],
      );
      expect(tokenOrder).toBeLessThan(
        __.enableCircleci.mock.invocationCallOrder[0],
      );
      expect(tokenOrder).toBeLessThan(
        __.enableRenovate.mock.invocationCallOrder[0],
      );
    });
    it.each([
      { title: 'only github', input: { renovate: false }, expected: true },
      { title: 'only renovate', input: { github: false }, expected: true },
      {
        title: 'neither github nor renovate',
        input: { github: false, renovate: false },
        expected: false,
      },
    ])(
      'should check the token for $title: $expected',
      async ({ input, expected }) => {
        await run({ circleci: false, ...input });
        expect(__.ensureGithubToken.mock.calls).toHaveLength(expected ? 1 : 0);
      },
    );
    it('should enable no service when the token check throws', async () => {
      vi.spyOn(__, 'ensureGithubToken').mockImplementation(() => {
        throw new Error('no token');
      });

      let actual = null;
      try {
        await run();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('message', 'no token');
      expect(__.enableGithub).not.toHaveBeenCalled();
      expect(__.enableCircleci).not.toHaveBeenCalled();
      expect(__.enableRenovate).not.toHaveBeenCalled();
    });
  });
});
