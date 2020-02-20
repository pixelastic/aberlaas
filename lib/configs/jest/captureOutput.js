/* eslint-disable import/no-commonjs */
const stdMocks = require('std-mocks');
const stripAnsi = require('strip-ansi');

module.exports = {
  async run(callback) {
    let stdout, stderr;

    try {
      stdMocks.use();
      await callback();
    } finally {
      const result = stdMocks.flush();
      stdMocks.restore();

      stdout = result.stdout;
      stderr = result.stderr;
    }
    return {
      stdout: this.cleanOutput(stdout),
      stderr: this.cleanOutput(stderr),
    };
  },
  cleanOutput(entries) {
    return entries.map(rawEntry => {
      let entry = rawEntry;
      if (Buffer.isBuffer(entry)) {
        entry = entry.toString();
      }
      return stripAnsi(entry.replace(/\n$/g, ''));
    });
  },
};
