import { __ } from '../ensureNpmLogin.js';

describe('ensureNpmLogin', () => {
  describe('npmRun', () => {
    it('should return stdout when command succeeds', async () => {
      vi.spyOn(__, 'run').mockReturnValue({
        stdout: 'pixelastic',
      });

      const actual = await __.npmRun('whoami');

      expect(actual).toEqual('pixelastic');
      expect(__.run).toHaveBeenCalledWith('npm whoami', {
        stdout: false,
        stderr: false,
      });
    });

    it('should throw formatted error for EXXX', async () => {
      vi.spyOn(__, 'run').mockRejectedValue({
        stderr: 'npm error code E123\nnpm error 123 Custom Error',
      });

      let actual = null;
      try {
        await __.npmRun('whoami');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_NPM_ERROR_E123');
      expect(actual.message).toContain('123 Custom Error');
    });

    it('should throw the raw error if not a parseable npm one', async () => {
      vi.spyOn(__, 'run').mockRejectedValue({
        stderr: 'Some other error message',
      });

      let actual = null;
      try {
        await __.npmRun('whoami');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_UNKNOWN_ERROR',
      );
      expect(actual.message).toContain('Some other error message');
    });
  });
});
