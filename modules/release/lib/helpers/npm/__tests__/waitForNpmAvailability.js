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
    vi.spyOn(__, 'getPublishedVersions').mockReturnValue({});
  });

  describe('when ready on the first check', () => {
    beforeEach(() => {
      __.getPublishedVersions.mockReturnValue({ aberlaas: '2.0.0' });
    });

    it('resolves after the first check', async () => {
      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.getPublishedVersions).toHaveBeenCalledTimes(1);
      expect(__.getPublishedVersions).toHaveBeenCalledWith(['aberlaas']);
    });

    it('does not sleep', async () => {
      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.sleep).not.toHaveBeenCalled();
    });
  });

  describe('when ready after several checks', () => {
    beforeEach(() => {
      __.getPublishedVersions
        .mockReturnValueOnce({ a: '1.0.0', b: '1.0.0', c: '1.0.0' })
        .mockReturnValueOnce({ a: '2.0.0', b: '1.0.0', c: '1.0.0' })
        .mockReturnValueOnce({ b: '2.0.0', c: '2.0.0' });
    });

    it('resolves after the third check', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.getPublishedVersions).toHaveBeenCalledTimes(3);
    });

    it('sleeps one minute between checks, one second at a time', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.sleep).toHaveBeenCalledTimes(120);
      expect(__.sleep).toHaveBeenCalledWith(1000);
    });

    it('only queries the pending packages on later checks', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.getPublishedVersions).toHaveBeenNthCalledWith(1, [
        'a',
        'b',
        'c',
      ]);
      expect(__.getPublishedVersions).toHaveBeenNthCalledWith(2, [
        'a',
        'b',
        'c',
      ]);
      expect(__.getPublishedVersions).toHaveBeenNthCalledWith(3, ['b', 'c']);
    });
  });

  describe('older versions', () => {
    it('does not treat an older version as ready', async () => {
      __.getPublishedVersions.mockReturnValue({ aberlaas: '1.9.9' });

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
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      __.getPublishedVersions.mockReturnValue({ a: '2.0.0', b: null });
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
      expect(__.getPublishedVersions).toHaveBeenCalledTimes(20);
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

  describe('Algolia failure', () => {
    it('continues after a failed check and resolves on a later success', async () => {
      __.getPublishedVersions
        .mockImplementationOnce(() => {
          throw new Error('Algolia down');
        })
        .mockReturnValueOnce({ aberlaas: '2.0.0' });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(__.getPublishedVersions).toHaveBeenCalledTimes(2);
    });

    it('mentions the last error when it times out', async () => {
      __.getPublishedVersions.mockImplementation(() => {
        throw new Error('Algolia down');
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
        'Packages not available on npm after 20 minutes:\naberlaas@2.0.0\nLast error: Algolia down',
      );
    });
  });

  describe('progress', () => {
    it('shows Check 1/20 on the first check', async () => {
      __.getPublishedVersions.mockReturnValue({ aberlaas: '2.0.0' });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      expect(tickTexts()[0]).toEqual('Check 1/20 — next check in 60s');
    });

    it('shows the check number increasing on each check', async () => {
      __.getPublishedVersions
        .mockReturnValueOnce({})
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ aberlaas: '2.0.0' });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = tickTexts();
      expect(texts).toContain('Check 1/20 — next check in 60s');
      expect(texts).toContain('Check 2/20 — next check in 60s');
      expect(texts).toContain('Check 3/20 — next check in 60s');
    });

    it('counts the seconds down every second between two checks', async () => {
      __.getPublishedVersions
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ aberlaas: '2.0.0' });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = tickTexts();
      expect(texts).toHaveLength(61);
      expect(texts).toHaveProperty('1', 'Check 1/20 — next check in 59s');
      expect(texts).toHaveProperty('2', 'Check 1/20 — next check in 58s');
      expect(texts).toHaveProperty('59', 'Check 1/20 — next check in 1s');
      expect(texts).toHaveProperty('60', 'Check 2/20 — next check in 60s');
    });

    it('shows a success message with the elapsed time', async () => {
      __.getPublishedVersions
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ aberlaas: '2.0.0' });
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
      __.getPublishedVersions.mockReturnValue({});

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
      __.getPublishedVersions
        .mockReturnValueOnce({})
        .mockReturnValueOnce({ aberlaas: '2.0.0' });

      await waitForNpmAvailability(['aberlaas'], '2.0.0');

      const texts = [
        ...tickTexts(),
        ...mockProgress.success.mock.calls.map(([text]) => text),
      ];
      expect(texts.join('\n')).not.toContain('aberlaas');
    });
  });
});
