import stdMocks from 'std-mocks';
import stripAnsi from 'strip-ansi';
import { _ } from 'golgoth';

export default {
  async run(callback) {
    stdMocks.use();
    try {
      await callback();
    } finally {
      stdMocks.restore();
    }
    const { stdout, stderr } = stdMocks.flush();
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
