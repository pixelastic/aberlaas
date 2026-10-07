import { _ } from 'golgoth';
import { firostError, sleep } from 'firost';
import { getPublishedVersions } from './getPublishedVersions.js';

const checkInterval = 60 * 1000;
const maxChecks = 20;

export let __;

/**
 * Wait until every package is available on npm at the released version
 * @param {string[]} packageNames - npm package names to wait for
 * @param {string} version - The released version each package must reach
 * @returns {Promise<void>}
 * @throws {Error} Throws ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT if some packages are still missing after the last check
 */
export async function waitForNpmAvailability(packageNames, version) {
  await __.check({ pending: packageNames, version, checkCount: 1 });
}

__ = {
  /**
   * Check the pending packages, then check again until none is pending
   * @param {object} state - Current loop state
   * @param {string[]} state.pending - Packages not yet available at the version
   * @param {string} state.version - The released version each package must reach
   * @param {number} state.checkCount - Number of this check, starting at 1
   * @param {Error} [state.lastError] - Last error thrown while reading versions
   * @returns {Promise<void>}
   */
  async check({ pending, version, checkCount, lastError }) {
    let published = {};
    let error = lastError;
    try {
      published = await __.getPublishedVersions(pending);
    } catch (err) {
      error = err;
    }

    const stillPending = _.reject(pending, (name) => {
      return published[name] === version;
    });

    if (_.isEmpty(stillPending)) {
      return;
    }

    if (checkCount >= maxChecks) {
      throw firostError(
        'ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT',
        __.getTimeoutMessage(stillPending, version, error),
      );
    }

    await __.sleep(checkInterval);
    await __.check({
      pending: stillPending,
      version,
      checkCount: checkCount + 1,
      lastError: error,
    });
  },

  /**
   * Build the message of the timeout error
   * @param {string[]} missing - Packages still missing at the end
   * @param {string} version - The released version
   * @param {Error} [error] - Last error thrown while reading versions
   * @returns {string} The error message
   */
  getTimeoutMessage(missing, version, error) {
    const minutes = (maxChecks * checkInterval) / 60000;
    const missingList = _.map(missing, (name) => `${name}@${version}`);
    const lines = [
      `Packages not available on npm after ${minutes} minutes:`,
      ...missingList,
    ];
    if (error) {
      lines.push(`Last error: ${error.message}`);
    }
    return lines.join('\n');
  },

  getPublishedVersions,
  sleep,
};
