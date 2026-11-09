import { firostError } from 'firost';
import { getEnvToken } from './getEnvToken.js';

export let __;

/**
 * Call the CircleCI API v2. GET by default, pass options to override.
 * @param {string} path - Path after /api/v2/
 * @param {object} [options] - fetch options to merge (method, body, extra headers, etc.)
 * @returns {object} Parsed JSON response
 * @throws {Error} When the API answers with a non-2xx status
 */
export async function callApi(path, options = {}) {
  const token = __.getEnvToken();
  const { headers: extraHeaders, ...rest } = options;

  const response = await __.fetch(`https://circleci.com/api/v2/${path}`, {
    headers: { 'Circle-Token': token, ...extraHeaders },
    ...rest,
  });
  const body = await response.json();

  if (!response.ok) {
    const error = firostError(
      'ABERLAAS_RELEASE_CIRCLECI_API_ERROR',
      `CircleCI API ${response.status} on ${path}: ${body?.message}`,
    );
    error.status = response.status;
    throw error;
  }

  return body;
}

__ = {
  getEnvToken,
  fetch,
};
