import { __, ensureYarnNpmLogin } from '../../helpers/yarn.js';

describe('release/helpers/yarn', () => {
  describe('ensureYarnNpmLogin', () => {
    it('should skip login when yarn npm whoami succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue();

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledTimes(1);
      expect(__.run).toHaveBeenCalledWith('yarn npm whoami', {
        stderr: false,
        stdout: false,
      });
    });

    it('should call yarn npm login when whoami fails', async () => {
      vi.spyOn(__, 'run')
        .mockImplementationOnce(() => {
          throw new Error('not logged in');
        })
        .mockReturnValueOnce() // yarn npm login
        .mockReturnValueOnce(); // re-check whoami

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledWith('yarn npm login', {
        stdin: true,
      });
    });

    it('should retry recursively after login', async () => {
      vi.spyOn(__, 'run')
        .mockImplementationOnce(() => {
          throw new Error('not logged in');
        })
        .mockReturnValueOnce() // yarn npm login
        .mockReturnValueOnce(); // recursive whoami check succeeds

      await ensureYarnNpmLogin();

      expect(__.run).toHaveBeenCalledTimes(3);
      expect(__.run).toHaveBeenLastCalledWith('yarn npm whoami', {
        stderr: false,
        stdout: false,
      });
    });
  });
});
