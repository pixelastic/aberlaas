import { _, got } from 'golgoth';
import { firostError } from 'firost';

export let __;

/**
 * Check if a CircleCI token is available
 * @returns {boolean} True if a token is defined
 */
export function hasToken() {
  return !!__.token();
}

/**
 * Make a call to the CircleCI v1 API
 * @param {string} urlPath Part of the url after the /api/v1.1/
 * @param {object} userGotOptions Options to pass to the got call
 * @returns {object} Object returned by the API
 */
export async function api(urlPath, userGotOptions = {}) {
  const token = __.token();
  const apiUrl = `https://circleci.com/api/v1.1/${urlPath}?circle-token=${token}`;
  const defaultGotOptions = {
    responseType: 'json',
  };
  const gotOptions = _.merge({}, defaultGotOptions, userGotOptions);
  try {
    const response = await __.got(apiUrl, gotOptions);
    return response.body;
  } catch (_error) {
    throw firostError(
      'ABERLAAS_SETUP_CIRCLECI_API',
      "Can't connect to CircleCI API. Check that you have a valid ABERLAAS_CIRCLECI_TOKEN",
    );
  }
}

__ = {
  /**
   * Returns the CircleCI token saved in ENV
   * @returns {string} The CircleCI token
   */
  token() {
    return process.env.ABERLAAS_CIRCLECI_TOKEN;
  },
  got,
};
