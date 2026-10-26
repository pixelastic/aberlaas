import { __, enable } from '../renovate.js';

describe('setup/renovate', () => {
  beforeEach(async () => {
    vi.spyOn(__, 'consoleSuccess').mockReturnValue();
    vi.spyOn(__, 'consoleInfo').mockReturnValue();
    vi.spyOn(__, 'consoleError').mockReturnValue();
    vi.spyOn(__, 'getRepoData').mockReturnValue({
      username: 'pixelastic',
      repo: 'aberlaas',
    });
    vi.spyOn(__, 'octokit').mockReturnValue();
  });
  describe('getRepositoryId', () => {
    it('should return the current repo id', async () => {
      __.octokit.mockReturnValue({ id: 42 });
      const actual = await __.getRepositoryId();
      expect(actual).toBe(42);
      expect(__.octokit).toHaveBeenCalledWith('repos.get', {
        owner: 'pixelastic',
        repo: 'aberlaas',
      });
    });
  });
  describe('isAlreadyEnabled', () => {
    it.each([
      {
        title: 'repo is in the installation',
        repositories: [{ owner: { login: 'pixelastic' }, name: 'aberlaas' }],
        expected: true,
      },
      {
        title: 'repo is not in the installation',
        repositories: [{ owner: { login: 'pixelastic' }, name: 'other' }],
        expected: false,
      },
    ])('returns $expected when $title', async ({ repositories, expected }) => {
      __.octokit.mockReturnValue({ repositories });
      const actual = await __.isAlreadyEnabled();
      expect(actual).toBe(expected);
    });
    it.each([{ input: 403 }, { input: 404 }])(
      'treats a $input as not enabled',
      async ({ input }) => {
        vi.spyOn(__, 'octokit').mockImplementation(() => {
          throw Object.assign(new Error(), { status: input });
        });
        const actual = await __.isAlreadyEnabled();
        expect(actual).toBe(false);
      },
    );
    it('rethrows other errors', async () => {
      const thrownError = Object.assign(new Error('Boom'), { status: 500 });
      vi.spyOn(__, 'octokit').mockImplementation(() => {
        throw thrownError;
      });

      let actual = null;
      try {
        await __.isAlreadyEnabled();
      } catch (error) {
        actual = error;
      }
      expect(actual).toBe(thrownError);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'consoleSuccess').mockReturnValue();
      vi.spyOn(__, 'consoleError').mockReturnValue();
      vi.spyOn(__, 'getRepositoryId').mockReturnValue();
      vi.spyOn(__, 'isAlreadyEnabled').mockReturnValue(false);
    });
    it.each([{ input: 403 }, { input: 404 }])(
      'should print "not installed" and stop on a $input',
      async ({ input }) => {
        vi.spyOn(__, 'octokit').mockImplementation(() => {
          throw Object.assign(new Error(), { status: input });
        });

        const actual = await enable();
        expect(actual).toBe(false);
        expect(__.consoleError).toHaveBeenCalledWith(
          'Renovate is not installed with this GitHub account',
        );
      },
    );
    it('should rethrow other errors when adding the repo', async () => {
      const thrownError = Object.assign(new Error('Boom'), { status: 500 });
      vi.spyOn(__, 'octokit').mockImplementation(() => {
        throw thrownError;
      });

      let actual = null;
      try {
        await enable();
      } catch (error) {
        actual = error;
      }
      expect(actual).toBe(thrownError);
      expect(__.consoleError).not.toHaveBeenCalled();
    });
    it('should add the repo id to the app installation', async () => {
      vi.spyOn(__, 'getRepositoryId').mockReturnValue(42);

      const actual = await enable();
      expect(actual).toBe(true);
      expect(__.consoleSuccess).toHaveBeenCalled();
      expect(__.octokit).toHaveBeenCalledWith('apps.addRepoToInstallation', {
        installation_id: __.renovateId,
        repository_id: 42,
      });
    });
  });
});
