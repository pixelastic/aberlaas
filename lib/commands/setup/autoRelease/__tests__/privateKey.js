import current from '../privateKey.js';
import sshHelper from '../../helpers/ssh.js';
import githubHelper from '../../helpers/github.js';
import circleciHelper from '../../helpers/circleci.js';

describe('setup > autoRelease > privateKey', () => {
  describe('enable', () => {
    beforeEach(async () => {
      vi.spyOn(current, '__consoleSuccess').mockReturnValue();
      vi.spyOn(sshHelper, 'getKeys').mockReturnValue({});
      vi.spyOn(circleciHelper, 'api').mockReturnValue();
      vi.spyOn(githubHelper, 'repoData').mockReturnValue({});
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
