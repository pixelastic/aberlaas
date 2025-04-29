export default {
  /**
   * Returns the npm token saved in ENV
   * @returns {string} The npm token
   */
  token() {
    return process.env.ABERLAAS_NPM_TOKEN;
  },
  /**
   * Check if a npm token is available
   * @returns {boolean} True if a token is defined
   */
  hasToken() {
    return !!this.token();
  },
};
