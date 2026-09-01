import { __, getCircleciTrustConfig } from '../getCircleciTrustConfig.js';

describe('getCircleciTrustConfig', () => {
  let mockProgress;
  let pipelineDefCallCount;

  beforeEach(() => {
    mockProgress = {
      tick: vi.fn(),
      success: vi.fn(),
      failure: vi.fn(),
    };
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
    vi.spyOn(__, 'sleep').mockReturnValue();
    pipelineDefCallCount = 0;

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
        pipelineDefCallCount++;
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
      vcsOrigin: 'github.com/myorg/myrepo',
    });
  });

  it('should call callApi with correct paths', async () => {
    await getCircleciTrustConfig();

    expect(__.callApi).toHaveBeenCalledWith('project/gh/myorg/myrepo');
    expect(__.callApi).toHaveBeenCalledWith(
      'projects/proj-uuid-456/pipeline-definitions',
    );
  });

  describe('when items are present on first call', () => {
    it('should not create a spinner', async () => {
      await getCircleciTrustConfig();

      expect(__.spinner).not.toHaveBeenCalled();
    });

    it('should not call sleep', async () => {
      await getCircleciTrustConfig();

      expect(__.sleep).not.toHaveBeenCalled();
    });
  });

  describe('when items are empty then present on retry', () => {
    beforeEach(() => {
      vi.spyOn(__, 'callApi').mockImplementation((path) => {
        if (path === 'project/gh/myorg/myrepo') {
          return {
            organization_id: 'org-uuid-123',
            id: 'proj-uuid-456',
          };
        }
        if (path === 'projects/proj-uuid-456/pipeline-definitions') {
          pipelineDefCallCount++;
          if (pipelineDefCallCount < 3) {
            return { items: [] };
          }
          return { items: [{ id: 'pipeline-def-789' }] };
        }
      });
    });

    it('should retry until items are non-empty', async () => {
      await getCircleciTrustConfig();

      expect(pipelineDefCallCount).toEqual(3);
    });

    it('should show spinner with waiting message', async () => {
      await getCircleciTrustConfig();

      expect(mockProgress.tick).toHaveBeenCalledWith(
        'Waiting for CircleCI pipeline definition...',
      );
    });

    it('should return correct pipeline definition ID once available', async () => {
      const actual = await getCircleciTrustConfig();

      expect(actual).toHaveProperty(
        'circleciPipelineDefinitionId',
        'pipeline-def-789',
      );
    });

    it('should finalize spinner on success', async () => {
      await getCircleciTrustConfig();

      expect(mockProgress.success).toHaveBeenCalledWith(
        'Pipeline definition found',
      );
    });
  });

  describe('when items is undefined', () => {
    beforeEach(() => {
      vi.spyOn(__, 'callApi').mockImplementation((path) => {
        if (path === 'project/gh/myorg/myrepo') {
          return {
            organization_id: 'org-uuid-123',
            id: 'proj-uuid-456',
          };
        }
        if (path === 'projects/proj-uuid-456/pipeline-definitions') {
          pipelineDefCallCount++;
          if (pipelineDefCallCount < 2) {
            return {};
          }
          return { items: [{ id: 'pipeline-def-789' }] };
        }
      });
    });

    it('should retry same as empty items', async () => {
      await getCircleciTrustConfig();

      expect(pipelineDefCallCount).toEqual(2);
      expect(__.sleep).toHaveBeenCalled();
    });
  });
});
