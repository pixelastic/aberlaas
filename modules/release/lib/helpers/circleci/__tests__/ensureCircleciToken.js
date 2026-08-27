import { __, ensureCircleciToken } from '../ensureCircleciToken.js';

describe('ensureCircleciToken', () => {
  it('should not throw when token is set', async () => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue('CCIPAT_abc123');

    let actual = null;
    try {
      await ensureCircleciToken();
    } catch (error) {
      actual = error;
    }

    expect(actual).toBeNull();
  });

  it.each([
    { title: 'missing', input: undefined },
    { title: 'empty string', input: '' },
  ])(
    'should throw ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN when token is $title',
    async ({ input }) => {
      vi.spyOn(__, 'getEnvToken').mockReturnValue(input);

      let actual = null;
      try {
        await ensureCircleciToken();
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN',
      );
      expect(actual.message).toContain('https://circleci.com/account/api');
    },
  );

  it('should throw ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN when token is not a Personal API Token', async () => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue('a1b2c3d4e5f6');

    let actual = null;
    try {
      await ensureCircleciToken();
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty(
      'code',
      'ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN',
    );
    expect(actual.message).toContain(
      'https://app.circleci.com/settings/user/tokens',
    );
  });
});
