import { __, getOrgAndRepo } from '../getOrgAndRepo.js';

describe('getOrgAndRepo', () => {
  it('should parse org and repo from git remote', async () => {
    vi.spyOn(__, 'createRepo').mockReturnValue({
      githubRepoOwner: vi.fn().mockReturnValue('myorg'),
      githubRepoName: vi.fn().mockReturnValue('myrepo'),
    });

    const actual = await getOrgAndRepo();

    expect(actual).toEqual({ org: 'myorg', repo: 'myrepo' });
  });
});
