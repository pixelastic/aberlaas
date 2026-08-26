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
    await triggerPipeline('v2.0.0', ['package-a', 'package-b']);

    expect(__.callApi).toHaveBeenCalledWith(
      'project/gh/myorg/myrepo/pipeline',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: 'v2.0.0',
          parameters: {
            trusted_publish: true,
            packages: 'package-a,package-b',
          },
        }),
      },
    );
  });

  it('should return pipeline ID', async () => {
    const actual = await triggerPipeline('v2.0.0', ['package-a']);

    expect(actual).toEqual('pipeline-uuid-123');
  });
});
