const consoleInfo = require('firost/lib/consoleInfo');
const consoleSuccess = require('firost/lib/consoleSuccess');
module.exports = {
  async isEnabled() {
    // TODO
  },
  async enable() {
    if (await this.isEnabled()) {
      this.__consoleInfo('SSH public key already saved on GitHub');
      return true;
    }

    // TODO: Call the API to set the SSH key
    this.__consoleSuccess('SSH public key saved on GitHub');
  },
  __consoleInfo: consoleInfo,
  __consoleSuccess: consoleSuccess,
};
