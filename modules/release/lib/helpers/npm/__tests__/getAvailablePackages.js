import { __, getAvailablePackages } from '../getAvailablePackages.js';

describe('npm/getAvailablePackages', () => {
  beforeEach(() => {
    vi.spyOn(__, 'fetch').mockImplementation((url) => {
      const found = url.includes('aberlaas/') || url.includes('%2fname/');
      return { ok: found, status: found ? 200 : 404 };
    });
  });

  it('returns the packages available at the version, in order', async () => {
    const actual = await getAvailablePackages(
      ['aberlaas', 'unknown-package', '@scope/name'],
      '2.0.0',
    );

    expect(actual).toEqual(['aberlaas', '@scope/name']);
  });

  it('sends one HEAD request per package, on the exact version', async () => {
    await getAvailablePackages(['aberlaas', '@scope/name'], '2.0.0');

    expect(__.fetch).toHaveBeenCalledTimes(2);
    const [url, options] = __.fetch.mock.calls[0];
    expect(url).toEqual('https://registry.npmjs.org/aberlaas/2.0.0');
    expect(options).toHaveProperty('method', 'HEAD');
    expect(options.headers).toHaveProperty('Cache-Control', 'no-cache');
    expect(__).toHaveProperty(
      'fetch.mock.calls.1.0',
      'https://registry.npmjs.org/@scope%2fname/2.0.0',
    );
  });

  it('throws when the request fails', async () => {
    vi.spyOn(__, 'fetch').mockImplementation(() => {
      throw new Error('network down');
    });

    let actual = null;
    try {
      await getAvailablePackages(['aberlaas'], '2.0.0');
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty('message', 'network down');
  });

  it('throws when the status is neither 2xx nor 404', async () => {
    vi.spyOn(__, 'fetch').mockReturnValue({ ok: false, status: 503 });

    let actual = null;
    try {
      await getAvailablePackages(['aberlaas'], '2.0.0');
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty(
      'code',
      'ABERLAAS_RELEASE_NPM_REGISTRY_FAILED',
    );
  });
});
