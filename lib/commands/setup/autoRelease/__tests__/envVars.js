const current = require('../envVars.js');
const npmHelper = require('../../helpers/npm.js');
const githubHelper = require('../../helpers/github.js');
const circleciHelper = require('../../helpers/circleci.js');
describe('setup > autoRelease > envVars', () => {
  describe('saveEnvVar', () => {
    beforeEach(async () => {
      jest.spyOn(githubHelper, 'repoData').mockReturnValue({});
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(circleciHelper, 'api').mockReturnValue();
    });
    it('should delete then add', async () => {
      await current.saveEnvVar();
      const firstCallArguments = circleciHelper.api.mock.calls[0];
      const secondCallArguments = circleciHelper.api.mock.calls[1];
      expect(firstCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'delete' })
      );
      expect(secondCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'post' })
      );
    });
    it('should ignore errors when deleting', async () => {
      circleciHelper.api.mockImplementation((url, options) => {
        if (options.method === 'delete') {
          throw new Error();
        }
      });

      let actual = null;
      try {
        await current.saveEnvVar();
      } catch (err) {
        actual = err;
      }
      expect(actual).toEqual(null);
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      jest.spyOn(npmHelper, 'token').mockReturnValue('npm_token');
      jest.spyOn(githubHelper, 'config').mockImplementation((input) => {
        return input;
      });
      jest.spyOn(current, 'saveEnvVar').mockReturnValue();
    });
    it('should save NPM_TOKEN', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith('NPM_TOKEN', 'npm_token');
    });
    it('should save GIT_USER_EMAIL', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith(
        'GIT_USER_EMAIL',
        'user.email'
      );
    });
    it('should save GIT_USER_NAME', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith(
        'GIT_USER_NAME',
        'user.name'
      );
    });
  });
});
