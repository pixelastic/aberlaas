const module = require('../helper.js');

describe('setup > helper', () => {
  describe('githubData', () => {
    it('should return .username and .repo', async () => {
      jest
        .spyOn(module, '__run')
        .mockReturnValue({ stdout: 'git@github.com:pixelastic/aberlaas.git' });
      const actual = await module.githubData();
      expect(actual).toHaveProperty('username', 'pixelastic');
      expect(actual).toHaveProperty('repo', 'aberlaas');
    });
  });
  describe('circleCiV1', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'circleCiToken').mockReturnValue('token');
      jest.spyOn(module, '__got').mockReturnValue({});
    });
    it('should call the full url with the token added', async () => {
      await module.circleCiV1('custom/path');
      expect(module.__got).toHaveBeenCalledWith(
        'https://circleci.com/api/v1.1/custom/path?circle-token=token',
        expect.anything()
      );
    });
    it('should allow passing custom options', async () => {
      await module.circleCiV1('custom/path', { method: 'post' });
      expect(module.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'post' })
      );
    });
    it('should return result as JSON', async () => {
      module.__got.mockReturnValue({ body: { reponame: 'aberlaas' } });
      const actual = await module.circleCiV1('custom/path');
      expect(module.__got).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ responseType: 'json' })
      );
      expect(actual).toHaveProperty('reponame', 'aberlaas');
    });
  });
});
