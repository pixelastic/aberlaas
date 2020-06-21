const module = require('../npmToken.js');
const npmHelper = require('../../helpers/npm.js');
const githubHelper = require('../../helpers/github.js');
const circleciHelper = require('../../helpers/circleci.js');
describe('setup > autoRelease > npmToken', () => {
  describe('isEnabled', () => {
    beforeEach(async () => {
      jest.spyOn(circleciHelper, 'api').mockReturnValue();
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
      jest.spyOn(npmHelper, 'token').mockReturnValue();
    });
    it('should return false if call fails', async () => {
      circleciHelper.api.mockImplementation(() => {
        throw new Error();
      });
      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
    it('should return false if token value does not match', async () => {
      npmHelper.token.mockReturnValue('token');
      circleciHelper.api.mockReturnValue({ value: 'xxxxnope' });

      const actual = await module.isEnabled();
      expect(actual).toEqual(false);
    });
    it('should return true if token value does match', async () => {
      npmHelper.token.mockReturnValue('token');
      circleciHelper.api.mockReturnValue({ value: 'xxxxoken' });

      const actual = await module.isEnabled();
      expect(actual).toEqual(true);
    });
  });
});
