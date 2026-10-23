import { _, pMap } from 'golgoth';
import { firostError } from 'firost';
import { encodePackageName } from './encodePackageName.js';

export let __;

/**
 * Get the packages that are available on the npm registry at an exact version
 * @param {string[]} packageNames - npm package names (may be scoped)
 * @param {string} version - The exact version each package must have
 * @returns {Promise<string[]>} Names of the packages available at that version
 * @throws {Error} Throws ABERLAAS_RELEASE_NPM_REGISTRY_FAILED if the registry answers neither 2xx nor 404
 */
export async function getAvailablePackages(packageNames, version) {
  const results = await pMap(packageNames, async (name) => {
    return { name, available: await __.isAvailable(name, version) };
  });

  return _.chain(results).filter('available').map('name').value();
}

__ = {
  /**
   * Check if one exact version of a package is on the registry
   * @param {string} name - npm package name (may be scoped)
   * @param {string} version - The exact version to look for
   * @returns {Promise<boolean>} True when the registry knows this version
   */
  async isAvailable(name, version) {
    const url = `https://registry.npmjs.org/${encodePackageName(name)}/${version}`;
    // The registry sends max-age=300, so we ask intermediaries not to reuse an
    // earlier 404
    const response = await __.fetch(url, {
      method: 'HEAD',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (response.status === 404) {
      return false;
    }
    if (!response.ok) {
      throw firostError(
        'ABERLAAS_RELEASE_NPM_REGISTRY_FAILED',
        `Could not read ${name}@${version} from the registry (HTTP ${response.status})`,
      );
    }
    return true;
  },

  fetch,
};
