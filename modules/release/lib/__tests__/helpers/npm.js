import { npmVersion } from 'aberlaas-versions';
import { __, ensureNpmLogin } from '../../helpers/npm.js';

describe('release/helpers/npm', () => {
  describe('ensureNpmLogin', () => {
    it('should skip login when npm whoami succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.run).toHaveBeenCalledTimes(1);
      expect(__.run).toHaveBeenCalledWith(`npx npm@${npmVersion} whoami`, {
        stderr: false,
        stdout: false,
      });
    });

    it('should call npm login when whoami fails', async () => {
      vi.spyOn(__, 'consoleInfo').mockReturnValue();
      vi.spyOn(__, 'prompt').mockReturnValue();
      vi.spyOn(__, 'run')
        .mockImplementationOnce(() => {
          throw new Error('not logged in');
        })
        .mockReturnValueOnce() // npm login
        .mockReturnValueOnce(); // recursive whoami check succeeds

      await ensureNpmLogin();

      expect(__.run).toHaveBeenCalledWith(
        `npx npm@${npmVersion} login --loglevel=warn`,
        { stdin: true },
      );
    });

    it('should use pinned npm version', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureNpmLogin();

      expect(__.run).toHaveBeenCalledWith(
        expect.stringContaining(`npm@${npmVersion}`),
        expect.any(Object),
      );
    });
  });
});
