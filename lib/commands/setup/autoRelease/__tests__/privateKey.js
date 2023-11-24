const current = require('../privateKey.js');
const sshHelper = require('../../helpers/ssh.js');
const githubHelper = require('../../helpers/github.js');
const circleciHelper = require('../../helpers/circleci.js');
describe('setup > autoRelease > privateKey', () => {
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(sshHelper, 'getKeys').mockReturnValue({});
      jest.spyOn(circleciHelper, 'api').mockReturnValue();
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
    });
    it('should delete then add', async () => {
      await current.enable();
      const firstCallArguments = circleciHelper.api.mock.calls[0];
      const secondCallArguments = circleciHelper.api.mock.calls[1];
      expect(firstCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'delete' }),
      );
      expect(secondCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'post' }),
      );
    });
  });
});
