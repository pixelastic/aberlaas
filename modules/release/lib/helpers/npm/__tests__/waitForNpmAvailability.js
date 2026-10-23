import { __, waitForNpmAvailability } from '../waitForNpmAvailability.js';

describe('npm/waitForNpmAvailability', () => {
  let mockProgress;
  let now;
  const tickTexts = () => mockProgress.tick.mock.calls.map(([text]) => text);

  beforeEach(() => {
    mockProgress = {
      tick: vi.fn(),
      success: vi.fn(),
      failure: vi.fn(),
    };
    now = 0;
    vi.spyOn(__, 'spinner').mockReturnValue(mockProgress);
    vi.spyOn(__, 'now').mockImplementation(() => now);
    vi.spyOn(__, 'sleep').mockReturnValue();
    vi.spyOn(__, 'getAvailablePackages').mockReturnValue([]);
  });

  describe('when ready on the first check', () => {
    beforeEach(() => {
      __.getAvailablePackages.mockReturnValue(['aberlaas']);
    });

    it('resolves after the first check', async () => {
      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.getAvailablePackages).toHaveBeenCalledTimes(1);
      expect(__.getAvailablePackages).toHaveBeenCalledWith(
        ['aberlaas'],
        '2.0.0',
      );
    });

    it('does not sleep', async () => {
      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.sleep).not.toHaveBeenCalled();
    });
  });

  describe('when ready after several checks', () => {
    beforeEach(() => {
      __.getAvailablePackages
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['a'])
        .mockReturnValueOnce(['b', 'c']);
    });

    it('resolves after the third check', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.getAvailablePackages).toHaveBeenCalledTimes(3);
    });

    it('sleeps one minute between checks, one second at a time', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.sleep).toHaveBeenCalledTimes(120);
      expect(__.sleep).toHaveBeenCalledWith(1000);
    });

    it('only queries the pending packages on later checks', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.getAvailablePackages).toHaveBeenNthCalledWith(
        1,
        ['a', 'b', 'c'],
        '2.0.0',
      );
      expect(__.getAvailablePackages).toHaveBeenNthCalledWith(
        2,
        ['a', 'b', 'c'],
        '2.0.0',
      );
      expect(__.getAvailablePackages).toHaveBeenNthCalledWith(
        3,
        ['b', 'c'],
        '2.0.0',
      );
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      __.getAvailablePackages.mockReturnValue(['a']);
    });

    it('throws after 20 checks', async () => {
      let actual = null;
      try {
        await waitForNpmAvailability(['a', 'b'], '2.0.0');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT',
      );
      expect(__.getAvailablePackages).toHaveBeenCalledTimes(20);
    });

    it('states the timeout and lists the missing packages, not the ready ones', async () => {
      let actual = null;
      try {
        await waitForNpmAvailability(['a', 'b'], '2.0.0');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'message',
        'Packages not available on npm after 20 minutes:\nb@2.0.0',
      );
    });
  });

  describe('Registry failure', () => {
    it('continues after a failed check and resolves on a later success', async () => {
      __.getAvailablePackages
        .mockImplementationOnce(() => {
          throw new Error('Registry down');
        })
        .mockReturnValueOnce(['aberlaas']);

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.getAvailablePackages).toHaveBeenCalledTimes(2);
    });

    it('mentions the last error when it times out', async () => {
      __.getAvailablePackages.mockImplementation(() => {
        throw new Error('Registry down');
      });

      let actual = null;
      try {
        await waitForNpmAvailability(['aberlaas'], '2.0.0');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT',
      );
      expect(actual).toHaveProperty(
        'message',
        'Packages not available on npm after 20 minutes:\naberlaas@2.0.0\nLast error: Registry down',
      );
    });
  });

  describe('progress', () => {
    it('shows check 1 on the first check', async () => {
      __.getAvailablePackages.mockReturnValue(['aberlaas']);

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(tickTexts()[0]).toEqual(
        'Checking availability on npm: #1 (next check in 60s)',
      );
    });

    it('shows the check number increasing on each check', async () => {
      __.getAvailablePackages
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['aberlaas']);

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = tickTexts();
      expect(texts).toContain(
        'Checking availability on npm: #1 (next check in 60s)',
      );
      expect(texts).toContain(
        'Checking availability on npm: #2 (next check in 60s)',
      );
      expect(texts).toContain(
        'Checking availability on npm: #3 (next check in 60s)',
      );
    });

    it('counts the seconds down every second between two checks', async () => {
      __.getAvailablePackages
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['aberlaas']);

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = tickTexts();
      expect(texts).toHaveLength(61);
      expect(texts).toHaveProperty(
        '1',
        'Checking availability on npm: #1 (next check in 59s)',
      );
      expect(texts).toHaveProperty(
        '2',
        'Checking availability on npm: #1 (next check in 58s)',
      );
      expect(texts).toHaveProperty(
        '59',
        'Checking availability on npm: #1 (next check in 1s)',
      );
      expect(texts).toHaveProperty(
        '60',
        'Checking availability on npm: #2 (next check in 60s)',
      );
    });

    it('shows a success message with the elapsed time', async () => {
      __.getAvailablePackages
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['aberlaas']);
      __.sleep.mockImplementation(() => {
        now += 1000;
      });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(mockProgress.success).toHaveBeenCalledWith(
        'All packages available on npm after 1m 0s',
      );
      expect(mockProgress.failure).not.toHaveBeenCalled();
    });

    it('marks the spinner as failed on timeout', async () => {
      __.getAvailablePackages.mockReturnValue([]);

      let actual = null;
      try {
        await waitForNpmAvailability(['aberlaas'], '2.0.0');
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty(
        'code',
        'ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT',
      );
      expect(mockProgress.failure).toHaveBeenCalledTimes(1);
      expect(mockProgress.success).not.toHaveBeenCalled();
    });

    it('does not list package names in the spinner text', async () => {
      __.getAvailablePackages
        .mockReturnValueOnce([])
        .mockReturnValueOnce(['aberlaas']);

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = [
        ...tickTexts(),
        ...mockProgress.success.mock.calls.map(([text]) => text),
      ];
      expect(texts.join('\n')).not.toContain('aberlaas');
    });
  });
});
