const circleci = require('./circleci.js');
module.exports = {
  async run() {
    await circleci.run();
  },
};
