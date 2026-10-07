import { _ } from 'golgoth';
import { firostError } from 'firost';

const algoliaApplicationId = 'OFCNCOG2CU';
const algoliaSearchKey = 'f54e21fa3a2a0160595bb058179bfb1e';
const algoliaIndexName = 'npm-search';

export let __;

/**
 * Get the latest published version of several packages, in one request
 * @param {string[]} packageNames - npm package names (may be scoped)
 * @returns {Promise<object>} Map of package name to its latest version, or null if it has no record
 * @throws {Error} Throws ABERLAAS_RELEASE_NPM_SEARCH_FAILED if the response status is not 2xx
 */
export async function getPublishedVersions(packageNames) {
  const response = await __.fetch(
    `https://${algoliaApplicationId}-dsn.algolia.net/1/indexes/*/objects`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': algoliaApplicationId,
        'X-Algolia-API-Key': algoliaSearchKey,
      },
      body: JSON.stringify({
        requests: _.map(packageNames, (objectID) => ({
          indexName: algoliaIndexName,
          objectID,
          attributesToRetrieve: ['name', 'version'],
        })),
      }),
    },
  );

  if (!response.ok) {
    throw firostError(
      'ABERLAAS_RELEASE_NPM_SEARCH_FAILED',
      `Could not read published versions (HTTP ${response.status})`,
    );
  }

  const { results } = await response.json();
  return _.chain(packageNames)
    .zipObject(results)
    .mapValues((record) => record?.version ?? null)
    .value();
}

__ = {
  fetch,
};
