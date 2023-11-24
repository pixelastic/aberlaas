import current from '../envVars.js';
import npmHelper from '../../helpers/npm.js';
import githubHelper from '../../helpers/github.js';
import circleciHelper from '../../helpers/circleci.js';

describe('setup > autoRelease > envVars', () => {
  describe('saveEnvVar', () => {
    beforeEach(async () => {
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({});
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(circleciHelper, 'api').mockReturnValue();
    });
    it('should delete then add', async () => {
      await current.saveEnvVar();
      const firstCallArguments = circleciHelper.api.mock.calls[0];
      const secondCallArguments = circleciHelper.api.mock.calls[1];
      expect(firstCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'delete' }),
      );
      expect(secondCallArguments[1]).toEqual(
        expect.objectContaining({ method: 'post' }),
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
      expect(actual).toBeNull();
    });
  });
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(npmHelper, 'token').mockReturnValue('npm_token');
      vi.spyOn(githubHelper, 'config').mockImplementation((input) => {
        return input;
      });
      vi.spyOn(current, 'saveEnvVar').mockReturnValue();
    });
    it('should save NPM_TOKEN', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith('NPM_TOKEN', 'npm_token');
    });
    it('should save GIT_USER_EMAIL', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith(
        'GIT_USER_EMAIL',
        'user.email',
      );
    });
    it('should save GIT_USER_NAME', async () => {
      await current.enable();
      expect(current.saveEnvVar).toHaveBeenCalledWith(
        'GIT_USER_NAME',
        'user.name',
      );
    });
  });
});
