import { firostError } from 'firost';
import { callApi } from './callApi.js';
import { getEnvToken } from './getEnvToken.js';

export let __;

/**
 * Ensure ABERLAAS_CIRCLECI_TOKEN is set and is a Personal API Token
 * @throws {Error} ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN if missing or empty
 * @throws {Error} ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN if not CCIPAT_ format
 */
export async function ensureCircleciToken() {
  const token = __.getEnvToken();
  // No token
  if (!token) {
    throw firostError(
      'ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN',
      'ABERLAAS_CIRCLECI_TOKEN is not set. Create one at https://circleci.com/account/api',
    );
  }

  // Not a personal API token
  __.ensurePersonalApiToken(token);
}

__ = {
  /**
   * Ensure the token is a Personal API Token (CCIPAT_ prefix)
   * @param {string} token - CircleCI token to validate
   * @throws {Error} ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN if not CCIPAT_ format
   */
  ensurePersonalApiToken(token) {
    if (token.startsWith('CCIPAT_')) {
      return;
    }

    throw firostError(
      'ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN',
      'ABERLAAS_CIRCLECI_TOKEN must be a Personal API Token (CCIPAT_ prefix). Create one at https://app.circleci.com/settings/user/tokens',
    );
  },
  callApi,
  getEnvToken,
};
