import { __, getCircleciTrustConfig } from '../getCircleciTrustConfig.js';

describe('getCircleciTrustConfig', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getOrgAndRepo').mockReturnValue({
      org: 'myorg',
      repo: 'myrepo',
    });
    vi.spyOn(__, 'callApi').mockImplementation((path) => {
      if (path === 'project/gh/myorg/myrepo') {
        return {
          organization_id: 'org-uuid-123',
          id: 'proj-uuid-456',
        };
      }
      if (path === 'projects/proj-uuid-456/pipeline-definitions') {
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

  it('should call callApi with correct paths', async () => {
    await getCircleciTrustConfig();

    expect(__.callApi).toHaveBeenCalledWith('project/gh/myorg/myrepo');
    expect(__.callApi).toHaveBeenCalledWith(
      'projects/proj-uuid-456/pipeline-definitions',
    );
  });
});
