import { __, callApi } from '../callApi.js';

describe('circleci/callApi', () => {
  beforeEach(() => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue('test-token');
    vi.spyOn(__, 'fetch').mockReturnValue({
      ok: true,
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

  it('should throw with the API message when the response is not ok', async () => {
    vi.spyOn(__, 'fetch').mockReturnValue({
      ok: false,
      status: 404,
      json: () => ({ message: 'Project not found' }),
    });

    let actual = null;
    try {
      await callApi('pipeline/undefined/workflow');
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty(
      'code',
      'ABERLAAS_RELEASE_CIRCLECI_API_ERROR',
    );
    expect(actual).toHaveProperty('status', 404);
    expect(actual.message).toContain('404');
    expect(actual.message).toContain('Project not found');
  });
});
