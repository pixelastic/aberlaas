import { __, getCircleciTrustConfig } from '../getCircleciTrustConfig.js';

describe('getCircleciTrustConfig', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getOrgAndRepo').mockReturnValue({
      org: 'myorg',
      repo: 'myrepo',
    });
    vi.spyOn(__, 'api').mockImplementation((path) => {
      if (path === 'gh/myorg/myrepo') {
        return {
          organization_id: 'org-uuid-123',
          id: 'proj-uuid-456',
        };
      }
      if (path === 'proj-uuid-456/pipeline-definitions') {
        return {
          items: [{ id: 'pipeline-def-789' }],
        };
      }
    });
  });

  it('should return circleciOrgId, circleciProjectId, circleciPipelineDefinitionId, vcsOrigin', async () => {
    const actual = await getCircleciTrustConfig();

    expect(actual).toEqual({
      circleciOrgId: 'org-uuid-123',
      circleciProjectId: 'proj-uuid-456',
      circleciPipelineDefinitionId: 'pipeline-def-789',
      vcsOrigin: 'github/myorg/myrepo',
    });
  });

  it('should call api with correct paths', async () => {
    await getCircleciTrustConfig();

    expect(__.api).toHaveBeenCalledWith('gh/myorg/myrepo');
    expect(__.api).toHaveBeenCalledWith('proj-uuid-456/pipeline-definitions');
  });

  describe('api', () => {
    const originalEnv = process.env.ABERLAAS_CIRCLECI_TOKEN;

    beforeEach(() => {
      process.env.ABERLAAS_CIRCLECI_TOKEN = 'test-token';
      __.api.mockRestore();
      vi.spyOn(__, 'fetch').mockReturnValue({
        json: () => ({ result: 'ok' }),
      });
    });
    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.ABERLAAS_CIRCLECI_TOKEN;
      } else {
        process.env.ABERLAAS_CIRCLECI_TOKEN = originalEnv;
      }
    });

    it('should call fetch with full URL and auth header', async () => {
      const actual = await __.api('gh/myorg/myrepo');

      expect(actual).toEqual({ result: 'ok' });
      expect(__.fetch).toHaveBeenCalledWith(
        'https://circleci.com/api/v2/project/gh/myorg/myrepo',
        {
          headers: {
            Authorization: 'Circle-Token test-token',
          },
        },
      );
    });
  });
});
