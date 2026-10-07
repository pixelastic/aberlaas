import { __, waitForNpmAvailability } from '../waitForNpmAvailability.js';

describe('npm/waitForNpmAvailability', () => {
  beforeEach(() => {
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

    it('sleeps one minute between checks', async () => {
      await waitForNpmAvailability(['a', 'b', 'c'], '2.0.0');

      expect(__.sleep).toHaveBeenCalledTimes(2);
      expect(__.sleep).toHaveBeenCalledWith(60 * 1000);
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
});
