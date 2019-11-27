import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';
import { _ } from 'golgoth';

export default {
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
    return _.map(entries, rawEntry => {
      let entry = rawEntry;
      if (_.isBuffer(entry)) {
        entry = entry.toString();
      }
      return stripAnsi(_.trim(entry, '\n'));
    });
  },
};
