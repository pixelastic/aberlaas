import { __, getPublishedVersions } from '../getPublishedVersions.js';

describe('getPublishedVersions', () => {
  beforeEach(() => {
    vi.spyOn(__, 'fetch').mockReturnValue({
      ok: true,
      status: 200,
      json: () => ({
        results: [
          { objectID: 'aberlaas', name: 'aberlaas', version: '2.39.3' },
          null,
          { objectID: '@scope/name', name: '@scope/name', version: '1.2.3' },
        ],
      }),
    });
  });

  it('returns the version of each package, null when it has no record', async () => {
    const actual = await getPublishedVersions([
      'aberlaas',
      'unknown-package',
      '@scope/name',
    ]);

    expect(actual).toEqual({
      aberlaas: '2.39.3',
      'unknown-package': null,
      '@scope/name': '1.2.3',
    });
  });

  it('sends all package names in a single request', async () => {
    await getPublishedVersions(['aberlaas', 'unknown-package', '@scope/name']);

    expect(__.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = __.fetch.mock.calls[0];
    expect(url).toEqual(
      'https://OFCNCOG2CU-dsn.algolia.net/1/indexes/*/objects',
    );
    expect(options).toHaveProperty('method', 'POST');
    expect(options.headers).toHaveProperty(
      'X-Algolia-Application-Id',
      'OFCNCOG2CU',
    );
    expect(options.headers).toHaveProperty(
      'X-Algolia-API-Key',
      'f54e21fa3a2a0160595bb058179bfb1e',
    );
    expect(JSON.parse(options.body)).toEqual({
      requests: [
        {
          indexName: 'npm-search',
          objectID: 'aberlaas',
          attributesToRetrieve: ['name', 'version'],
        },
        {
          indexName: 'npm-search',
          objectID: 'unknown-package',
          attributesToRetrieve: ['name', 'version'],
        },
        {
          indexName: 'npm-search',
          objectID: '@scope/name',
          attributesToRetrieve: ['name', 'version'],
        },
      ],
    });
  });

  it('throws when the request fails', async () => {
    vi.spyOn(__, 'fetch').mockImplementation(() => {
      throw new Error('network down');
    });

    let actual = null;
    try {
      await getPublishedVersions(['aberlaas']);
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty('message', 'network down');
  });

  it('throws when the response status is not 2xx', async () => {
    vi.spyOn(__, 'fetch').mockReturnValue({ ok: false, status: 503 });

    let actual = null;
    try {
      await getPublishedVersions(['aberlaas']);
    } catch (error) {
      actual = error;
    }

    expect(actual).toHaveProperty('code', 'ABERLAAS_RELEASE_NPM_SEARCH_FAILED');
  });
});
