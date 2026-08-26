import { __, ensureCircleciToken } from '../ensureCircleciToken.js';

describe('ensureCircleciToken', () => {
  it('should not throw when token is set', async () => {
    vi.spyOn(__, 'getEnvToken').mockReturnValue('my-token');

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
});
