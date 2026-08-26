import { npmVersion } from 'aberlaas-versions';
import {
  __,
  isTrustedPublisherRegistered,
  registerTrustedPublisher,
} from '../npm.js';

describe('release/helpers/npm', () => {
  describe('registerTrustedPublisher', () => {
    it('should run npm trust circleci with all flags', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await registerTrustedPublisher({
        packageName: '@scope/my-package',
        otp: '654321',
        circleciOrgId: 'org-uuid',
        circleciProjectId: 'proj-uuid',
        circleciPipelineDefinitionId: 'pipe-uuid',
        vcsOrigin: 'gh/owner/repo',
      });

      expect(__.run).toHaveBeenCalledWith([
        'npx',
        `npm@${npmVersion}`,
        'trust',
        'circleci',
        '@scope/my-package',
        '--org-id',
        'org-uuid',
        '--project-id',
        'proj-uuid',
        '--pipeline-definition-id',
        'pipe-uuid',
        '--vcs-origin',
        'gh/owner/repo',
        '--allow-publish',
        '--otp',
        '654321',
      ]);
    });
  });

  describe('isTrustedPublisherRegistered', () => {
    const matchingProjectId = 'abc-123-def';

    beforeEach(() => {
      vi.spyOn(__, 'fetch').mockReturnValue({
        json: () => [
          {
            type: 'circleci',
            claims: { 'oidc.circleci.com/project-id': matchingProjectId },
          },
          {
            type: 'github-actions',
            claims: { repository: 'owner/repo' },
          },
          {
            type: 'circleci',
            claims: { 'oidc.circleci.com/project-id': 'other-id' },
          },
        ],
      });
    });

    it.each([
      {
        title: 'matching CircleCI publisher found',
        projectId: matchingProjectId,
        expected: true,
      },
      {
        title: 'different projectId',
        projectId: 'wrong-id',
        expected: false,
      },
      {
        title: 'empty array',
        fetchResponse: [],
        projectId: matchingProjectId,
        expected: false,
      },
      {
        title: 'only GitHub publishers',
        fetchResponse: [
          { type: 'github-actions', claims: { repository: 'owner/repo' } },
        ],
        projectId: matchingProjectId,
        expected: false,
      },
    ])('$title', async ({ projectId, fetchResponse, expected }) => {
      if (fetchResponse) {
        vi.spyOn(__, 'fetch').mockReturnValue({ json: () => fetchResponse });
      }

      const actual = await isTrustedPublisherRegistered(
        'my-package',
        projectId,
      );

      expect(actual).toEqual(expected);
    });

    it('should encode scoped package names', async () => {
      await isTrustedPublisherRegistered(
        '@scope/my-package',
        matchingProjectId,
      );

      expect(__.fetch).toHaveBeenCalledWith(
        'https://registry.npmjs.org/-/package/%40scope%2Fmy-package/trust',
      );
    });
  });
});
