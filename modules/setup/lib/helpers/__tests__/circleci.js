import { __, api } from '../circleci.js';

describe('setup/helpers/circleci', () => {
  describe('api', () => {
    beforeEach(async () => {
      vi.spyOn(__, 'token').mockReturnValue('token');
      vi.spyOn(__, 'got').mockReturnValue({});
    });
    it('should call the full url with the token added', async () => {
      await api('custom/path');
      expect(__.got).toHaveBeenCalledWith(
        'https://circleci.com/api/v1.1/custom/path?circle-token=token',
        expect.anything(),
      );
    });
    it('should allow passing custom options', async () => {
      await api('custom/path', { method: 'post' });
      expect(__.got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'post' }),
      );
    });
    it('should return result as JSON', async () => {
      __.got.mockReturnValue({ body: { reponame: 'aberlaas' } });
      const actual = await api('custom/path');
      expect(__.got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ responseType: 'json' }),
      );
      expect(actual).toHaveProperty('reponame', 'aberlaas');
    });
  });
});
