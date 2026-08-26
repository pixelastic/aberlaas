import { env } from 'firost';

/**
 * Read ABERLAAS_CIRCLECI_TOKEN from environment
 * @returns {string|undefined} Token value
 */
export function getEnvToken() {
  return env('ABERLAAS_CIRCLECI_TOKEN');
}
