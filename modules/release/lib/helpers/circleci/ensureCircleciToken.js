import { firostError } from 'firost';
import { callApi } from './callApi.js';
import { getEnvToken } from './getEnvToken.js';

export let __;

/**
 * Ensure ABERLAAS_CIRCLECI_TOKEN is set and is a Personal API Token
 * @throws {Error} ABERLAAS_RELEASE_NO_CIRCLECI_TOKEN if missing or empty
 * @throws {Error} ABERLAAS_RELEASE_CIRCLECI_TOKEN_NOT_PERSONAL_API_TOKEN if not CCIPAT_ format
 * @throws {Error} ABERLAAS_RELEASE_CIRCLECI_TOKEN_INVALID if token is expired or revoked
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

  // Token expired or revoked
  await __.ensureTokenNotExpired();
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
  /**
   * Verify the token is still valid by calling the /me endpoint
   * @throws {Error} ABERLAAS_RELEASE_CIRCLECI_TOKEN_INVALID if token is expired or revoked
   */
  async ensureTokenNotExpired() {
    const response = await __.callApi('me');
    if (!response.login) {
      throw firostError(
        'ABERLAAS_RELEASE_CIRCLECI_TOKEN_INVALID',
        'ABERLAAS_CIRCLECI_TOKEN is invalid or expired. Create a new one at https://app.circleci.com/settings/user/tokens',
      );
    }
  },
  callApi,
  getEnvToken,
};
