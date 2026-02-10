import current from '../circleci.js';

describe('setup/circleci', () => {
  describe('api', () => {
    beforeEach(async () => {
      vi.spyOn(current, 'token').mockReturnValue('token');
      vi.spyOn(current, '__got').mockReturnValue({});
    });
    it('should call the full url with the token added', async () => {
      await current.api('custom/path');
      expect(current.__got).toHaveBeenCalledWith(
        'https://circleci.com/api/v1.1/custom/path?circle-token=token',
        expect.anything(),
      );
    });
    it('should allow passing custom options', async () => {
      await current.api('custom/path', { method: 'post' });
      expect(current.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'post' }),
      );
    });
    it('should return result as JSON', async () => {
      current.__got.mockReturnValue({ body: { reponame: 'aberlaas' } });
      const actual = await current.api('custom/path');
      expect(current.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ responseType: 'json' }),
      );
      expect(actual).toHaveProperty('reponame', 'aberlaas');
    });
  });
});
