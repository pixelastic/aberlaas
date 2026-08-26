import { __, pollPipelineStatus } from '../pollPipelineStatus.js';

describe('circleci/pollPipelineStatus', () => {
  let mockProgress;
  let jobCallCount;

  const workflowResponse = {
    items: [
      {
        id: 'wf-1',
        name: 'trusted-publish',
        pipeline_number: 42,
        project_slug: 'gh/myorg/myrepo',
      },
    ],
  };

  beforeEach(() => {
    mockProgress = {
      tick: vi.fn(),
      success: vi.fn(),
      failure: vi.fn(),
    };
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
    vi.spyOn(__, 'sleep').mockReturnValue();
    jobCallCount = 0;
  });

  it('should poll until success', async () => {
    vi.spyOn(__, 'callApi').mockImplementation((path) => {
      if (path.startsWith('pipeline/')) {
        return workflowResponse;
      }
      jobCallCount++;
      return {
        items: [
          {
            id: 'job-1',
            name: 'trusted-publish',
            status: jobCallCount >= 2 ? 'success' : 'running',
            job_number: 7,
          },
        ],
      };
    });

    await pollPipelineStatus('pipeline-123');

    expect(mockProgress.success).toHaveBeenCalledWith(
      expect.stringContaining('Trusted publish'),
    );
    expect(__.sleep).toHaveBeenCalledWith(15000);
  });

  it('should throw with error and link on failure', async () => {
    vi.spyOn(__, 'callApi').mockImplementation((path) => {
      if (path.startsWith('pipeline/')) {
        return workflowResponse;
      }
      return {
        items: [
          {
            id: 'job-1',
            name: 'trusted-publish',
            status: 'failed',
            job_number: 7,
          },
        ],
      };
    });

    let actual = null;
    try {
      await pollPipelineStatus('pipeline-123');
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_CI_PUBLISH_FAILED');
    expect(actual.message).toContain('https://app.circleci.com');
    expect(mockProgress.failure).toHaveBeenCalled();
  });

  it('should display spinner with job status updates', async () => {
    vi.spyOn(__, 'callApi').mockImplementation((path) => {
      if (path.startsWith('pipeline/')) {
        return workflowResponse;
      }
      jobCallCount++;
      return {
        items: [
          {
            id: 'job-1',
            name: 'trusted-publish',
            status: jobCallCount >= 3 ? 'success' : 'running',
            job_number: 7,
          },
        ],
      };
    });

    await pollPipelineStatus('pipeline-123');

    expect(mockProgress.tick).toHaveBeenCalledWith(
      expect.stringContaining('running'),
    );
  });
});
