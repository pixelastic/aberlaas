import { __, callApi } from '../callApi.js';

describe('circleci/callApi', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue('test-token');
    vi.spyOn(__, 'fetch').mockReturnValue({
      json: () => ({ id: 'pipeline-123' }),
    });
  });

  it('should GET by default with auth header', async () => {
    const actual = await callApi('pipeline/abc-123/workflow');

    expect(actual).toEqual({ id: 'pipeline-123' });
    expect(__.fetch).toHaveBeenCalledWith(
      'https://circleci.com/api/v2/pipeline/abc-123/workflow',
      {
        headers: {
          'Circle-Token': 'test-token',
        },
      },
    );
  });

  it('should merge options for POST requests', async () => {
    const body = JSON.stringify({ tag: 'v1.0.0' });

    await callApi('project/gh/myorg/myrepo/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    expect(__.fetch).toHaveBeenCalledWith(
      'https://circleci.com/api/v2/project/gh/myorg/myrepo/pipeline',
      {
        method: 'POST',
        headers: {
          'Circle-Token': 'test-token',
          'Content-Type': 'application/json',
        },
        body,
      },
    );
  });
});
