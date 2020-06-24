const stdMocks = require('std-mocks');
const stripAnsi = require('strip-ansi');

const captureOutput = {
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
      stdout: captureOutput.cleanOutput(stdout),
      stderr: captureOutput.cleanOutput(stderr),
    };
  },
  cleanOutput(entries) {
    return entries.map((rawEntry) => {
      let entry = rawEntry;
      if (Buffer.isBuffer(entry)) {
        entry = entry.toString();
      }
      return stripAnsi(entry.replace(/\n$/g, ''));
    });
  },
};
module.exports = captureOutput;
