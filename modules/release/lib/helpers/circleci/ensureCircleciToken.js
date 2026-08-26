import { firostError } from 'firost';
import { getEnvToken } from './getEnvToken.js';

export let __;

/**
 * Ensure ABERLAAS_CIRCLECI_TOKEN is set
 * @throws {Error} ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN if missing or empty
 */
export async function ensureCircleciToken() {
  const token = __.getEnvToken();
  if (!token) {
    throw firostError(
      'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN',
      'ABERLAAS_CIRCLECI_TOKEN is not set. Create one at https://circleci.com/account/api',
    );
  }
}

__ = {
  getEnvToken,
};
