import { _, pMap } from 'golgoth';
import { prompt } from 'firost';

export let __;

/**
 * Check if an error is an OTP-related error (npm EOTP or Yarn Berry YN0041)
 * @param {object} error - Error object with message and/or stderr
 * @returns {boolean} True if the error is OTP-related
 */
export function isOtpError(error) {
  const haystack = `${error.message || ''} ${error.stderr || ''}`;
  return _.includes(haystack, 'EOTP') || _.includes(haystack, 'YN0041');
}

/**
 * Run a callback on each item with OTP, retrying OTP failures recursively
 * @param {Array} items - Items to process
 * @param {Function} callback - Async function receiving (item, otp)
 * @returns {Promise<void>}
 */
export async function withOtpRetry(items, callback) {
  const otp = await __.prompt('Enter OTP code:');
  const failures = [];

  await pMap(
    items,
    async (item) => {
      try {
        await callback(item, otp);
      } catch (error) {
        if (!isOtpError(error)) {
          throw error;
        }
        failures.push(item);
      }
    },
    { concurrency: 5 },
  );

  if (!_.isEmpty(failures)) {
    await withOtpRetry(failures, callback);
  }
}

__ = {
  prompt,
};
