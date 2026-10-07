import { _ } from 'golgoth';
import { firostError, sleep, spinner } from 'firost';
import { getPublishedVersions } from './getPublishedVersions.js';

const checkIntervalSeconds = 60;
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
  const progress = __.spinner();
  const startTime = __.now();
  await __.check({
    pending: packageNames,
    version,
    checkCount: 1,
    progress,
    startTime,
  });
}

__ = {
  /**
   * Check the pending packages, then check again until none is pending
   * @param {object} state - Current loop state
   * @param {string[]} state.pending - Packages not yet available at the version
   * @param {string} state.version - The released version each package must reach
   * @param {number} state.checkCount - Number of this check, starting at 1
   * @param {object} state.progress - Spinner instance
   * @param {number} state.startTime - Timestamp of the start of the wait, in ms
   * @param {Error} [state.lastError] - Last error thrown while reading versions
   * @returns {Promise<void>}
   */
  async check({
    pending,
    version,
    checkCount,
    progress,
    startTime,
    lastError,
  }) {
    progress.tick(__.getProgressText(checkCount, checkIntervalSeconds));

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
      const elapsed = __.formatDuration(__.now() - startTime);
      progress.success(`All packages available on npm after ${elapsed}`);
      return;
    }

    if (checkCount >= maxChecks) {
      progress.failure('Packages not available on npm');
      throw firostError(
        'ABERLAAS_RELEASE_NPM_AVAILABILITY_TIMEOUT',
        __.getTimeoutMessage(stillPending, version, error),
      );
    }

    await __.countdown({
      progress,
      checkCount,
      seconds: checkIntervalSeconds,
    });
    await __.check({
      pending: stillPending,
      version,
      checkCount: checkCount + 1,
      progress,
      startTime,
      lastError: error,
    });
  },

  /**
   * Wait the given number of seconds, updating the spinner every second
   * @param {object} state - Countdown state
   * @param {object} state.progress - Spinner instance
   * @param {number} state.checkCount - Number of the check just done
   * @param {number} state.seconds - Seconds left before the next check
   * @returns {Promise<void>}
   */
  async countdown({ progress, checkCount, seconds }) {
    await __.sleep(1000);
    const remaining = seconds - 1;
    if (remaining <= 0) {
      return;
    }
    progress.tick(__.getProgressText(checkCount, remaining));
    await __.countdown({ progress, checkCount, seconds: remaining });
  },

  /**
   * Build the spinner text of a check
   * @param {number} checkCount - Number of the current check
   * @param {number} seconds - Seconds left before the next check
   * @returns {string} The spinner text
   */
  getProgressText(checkCount, seconds) {
    return `Check ${checkCount}/${maxChecks} — next check in ${seconds}s`;
  },

  /**
   * Format a duration in minutes and seconds
   * @param {number} milliseconds - Duration in ms
   * @returns {string} The formatted duration, like 2m 5s
   */
  formatDuration(milliseconds) {
    const totalSeconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  },

  /**
   * Build the message of the timeout error
   * @param {string[]} missing - Packages still missing at the end
   * @param {string} version - The released version
   * @param {Error} [error] - Last error thrown while reading versions
   * @returns {string} The error message
   */
  getTimeoutMessage(missing, version, error) {
    const minutes = (maxChecks * checkIntervalSeconds) / 60;
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

  now: Date.now,

  getPublishedVersions,

  sleep,

  spinner,
};
