import { __, ensureCircleciToken } from '../ensureCircleciToken.js';

describe('ensureCircleciToken', () => {
  it.each([
    {
      title: 'missing token',
      token: undefined,
      apiResponse: { login: 'timvdl' },
      expected: 'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN',
    },
    {
      title: 'empty token',
      token: '',
      apiResponse: { login: 'timvdl' },
      expected: 'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN',
    },
    {
      title: 'non-CCIPAT token',
      token: 'a1b2c3d4e5f6',
      apiResponse: { login: 'timvdl' },
      expected: 'ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN',
    },
    {
      title: 'expired token',
      token: 'CCIPAT_abc123',
      apiResponse: { message: 'Permission denied' },
      expected: 'ABERLAAS_RELEASE_CIRCLECI_TOKEN_INVALID',
    },
    {
      title: 'valid token',
      token: 'CCIPAT_abc123',
      apiResponse: { login: 'timvdl' },
      expected: null,
    },
  ])('$title', async ({ token, apiResponse, expected }) => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue(token);
    vi.spyOn(__, 'callApi').mockReturnValue(apiResponse);

    let actual = null;
    try {
      await ensureCircleciToken();
    } catch (error) {
      actual = error?.code;
    }

    expect(actual).toEqual(expected);
  });
});
