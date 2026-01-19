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

  describe('getNpmUsername', () => {
    let mockedEnvs = {};
    beforeEach(async () => {
      vi.spyOn(__, 'env').mockImplementation((key) => {
        return mockedEnvs[key];
      });
    });
    it('should return env variable when set', async () => {
      mockedEnvs = { ABERLAAS_NPM_USERNAME: 'pixelastic' };
      const actual = await __.getNpmUsername();

      expect(actual).toEqual('pixelastic');
    });

    it('should prompt user when env variable is undefined', async () => {
      mockedEnvs = {};
      vi.spyOn(__, 'prompt').mockReturnValue('my-user');

      const actual = await __.getNpmUsername();

      expect(actual).toEqual('my-user');
    });

    it('should prompt user when env variable is null', async () => {
      mockedEnvs = { ABERLAAS_NPM_USERNAME: '' };
      vi.spyOn(__, 'prompt').mockReturnValue('my-user');

      const actual = await __.getNpmUsername();

      expect(actual).toEqual('my-user');
    });
  });
});
