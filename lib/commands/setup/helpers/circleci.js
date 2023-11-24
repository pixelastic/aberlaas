import got from 'golgoth/got.js';
import _ from 'golgoth/lodash.js';
import firostError from 'firost/error.js';

export default {
  /**
   * Returns the CircleCI token saved in ENV
   * @returns {string} The CircleCI token
   **/
  token() {
    return process.env.CIRCLECI_TOKEN;
  },
  /**
   * Check if a CircleCI token is available
   * @returns {boolean} True if a token is defined
   **/
  hasToken() {
    return !!this.token();
  },
  /**
   * Make a call to the CircleCI v1 API
   * @param {string} urlPath Part of the url after the /api/v1.1/
   * @param {object} userGotOptions Options to pass to the got call
   * @returns {object} Object returned by the API
   **/
  async api(urlPath, userGotOptions = {}) {
    const token = this.token();
    const apiUrl = `https://circleci.com/api/v1.1/${urlPath}?circle-token=${token}`;
    const defaultGotOptions = {
      responseType: 'json',
    };
    const gotOptions = _.merge({}, defaultGotOptions, userGotOptions);
    try {
      const response = await this.__got(apiUrl, gotOptions);
      return response.body;
    } catch (error) {
      throw firostError(
        'ERROR_CIRCLECI',
        "Can't connect to CircleCI API. Check that you have a valid CIRCLECI_TOKEN",
      );
    }
  },
  __got: got,
};
