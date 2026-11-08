import { __, triggerPipeline } from '../triggerPipeline.js';

describe('circleci/triggerPipeline', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getOrgAndRepo').mockReturnValue({
      org: 'myorg',
      repo: 'myrepo',
    });
    vi.spyOn(__, 'callApi').mockReturnValue({ id: 'pipeline-uuid-123' });
  });

  it('should POST to CircleCI API with correct parameters', async () => {
    await triggerPipeline(['package-a', 'package-b']);

    expect(__.callApi).toHaveBeenCalledWith(
      'project/gh/myorg/myrepo/pipeline',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: 'main',
          parameters: {
            trusted_publish: true,
            packages: 'package-a,package-b',
          },
        }),
      },
    );
  });

  it('should return pipeline ID', async () => {
    const actual = await triggerPipeline(['package-a']);

    expect(actual).toEqual('pipeline-uuid-123');
  });

  it('should throw when the response has no pipeline ID', async () => {
    vi.spyOn(__, 'callApi').mockReturnValue({ message: 'Something odd' });

    let actual = null;
    try {
      await triggerPipeline(['package-a']);
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty(
      'code',
      'ABERLAAS_RELEASE_CIRCLECI_NO_PIPELINE_ID',
    );
    expect(actual.message).toContain('Something odd');
  });
});
