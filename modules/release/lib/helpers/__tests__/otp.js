import { __, isOtpError, withOtpRetry } from '../otp.js';

describe('release/helpers/otp', () => {
  describe('isOtpError', () => {
    it.each([
      {
        title: 'EOTP in message',
        error: { message: 'EOTP This operation requires a one-time password' },
        expected: true,
      },
      {
        title: 'EOTP in stderr',
        error: { stderr: 'npm ERR! code EOTP' },
        expected: true,
      },
      {
        title: 'YN0041 in message',
        error: { message: 'YN0041: Invalid authentication' },
        expected: true,
      },
      {
        title: 'YN0041 in stderr',
        error: { stderr: 'Error YN0041: OTP required' },
        expected: true,
      },
      {
        title: 'unrelated error message',
        error: { message: 'ENOENT: no such file' },
        expected: false,
      },
      {
        title: 'unrelated error stderr',
        error: { stderr: 'permission denied' },
        expected: false,
      },
      {
        title: 'empty error',
        error: {},
        expected: false,
      },
    ])('$title', ({ error, expected }) => {
      const actual = isOtpError(error);
      expect(actual).toEqual(expected);
    });
  });

  describe('withOtpRetry', () => {
    beforeEach(() => {
      vi.spyOn(__, 'prompt').mockReturnValue('123456');
    });

    it('should prompt for OTP before running callbacks', async () => {
      const callback = vi.fn();

      await withOtpRetry(['a'], callback);

      expect(__.prompt).toHaveBeenCalledBefore(callback);
    });

    it('should pass OTP to each callback invocation', async () => {
      vi.spyOn(__, 'prompt').mockReturnValue('999999');
      const callback = vi.fn();

      await withOtpRetry(['a', 'b'], callback);

      expect(callback).toHaveBeenCalledWith('a', '999999');
      expect(callback).toHaveBeenCalledWith('b', '999999');
    });

    it('should retry only failed items with a new OTP on OTP error', async () => {
      vi.spyOn(__, 'prompt')
        .mockReturnValueOnce('111111')
        .mockReturnValueOnce('222222');

      const callback = vi.fn().mockImplementation((item, otp) => {
        if (item === 'b' && otp === '111111') {
          throw { message: 'EOTP' };
        }
      });

      await withOtpRetry(['a', 'b'], callback);

      // First round: both called with 111111
      expect(callback).toHaveBeenCalledWith('a', '111111');
      expect(callback).toHaveBeenCalledWith('b', '111111');
      // Retry round: only 'b' called with 222222
      expect(callback).toHaveBeenCalledWith('b', '222222');
      expect(callback).not.toHaveBeenCalledWith('a', '222222');
    });

    it('should throw immediately on non-OTP errors', async () => {
      const nonOtpError = new Error('ECONNREFUSED');
      const callback = vi.fn().mockImplementation(() => {
        throw nonOtpError;
      });

      let actual = null;
      try {
        await withOtpRetry(['a'], callback);
      } catch (error) {
        actual = error;
      }

      expect(actual).toEqual(nonOtpError);
    });

    it('should handle mixed results (some succeed, some OTP-fail)', async () => {
      vi.spyOn(__, 'prompt')
        .mockReturnValueOnce('111111')
        .mockReturnValueOnce('222222');

      const results = [];
      const callback = vi.fn().mockImplementation((item, otp) => {
        if (item === 'b' && otp === '111111') {
          throw { message: 'EOTP' };
        }
        results.push(`${item}:${otp}`);
      });

      await withOtpRetry(['a', 'b', 'c'], callback);

      // 'a' and 'c' succeed first round, 'b' retried second round
      expect(results.sort()).toEqual(['a:111111', 'b:222222', 'c:111111']);
      // prompt called exactly twice (initial + retry)
      expect(__.prompt).toHaveBeenCalledTimes(2);
    });
  });
});
