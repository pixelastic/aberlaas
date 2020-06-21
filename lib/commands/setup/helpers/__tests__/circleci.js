const module = require('../circleci.js');

describe('setup > helpers > circleci', () => {
  describe('api', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'token').mockReturnValue('token');
      jest.spyOn(module, '__got').mockReturnValue({});
    });
    it('should call the full url with the token added', async () => {
      await module.api('custom/path');
      expect(module.__got).toHaveBeenCalledWith(
        'https://circleci.com/api/v1.1/custom/path?circle-token=token',
        expect.anything()
      );
    });
    it('should allow passing custom options', async () => {
      await module.api('custom/path', { method: 'post' });
      expect(module.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'post' })
      );
    });
    it('should return result as JSON', async () => {
      module.__got.mockReturnValue({ body: { reponame: 'aberlaas' } });
      const actual = await module.api('custom/path');
      expect(module.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ responseType: 'json' })
      );
      expect(actual).toHaveProperty('reponame', 'aberlaas');
    });
  });
});
