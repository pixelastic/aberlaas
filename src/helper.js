import firost from 'firost';
import spawn from 'cross-spawn';
export default {
  /**
   * Returns path to a specific binary.
   * Will use the local yarn version of the host if available, or the one
   * defined in aberlaas otherwise
   * @param {String} bin Binary name
   * @returns {String} Path to the binary
   **/
  async which(bin) {
    // Try to find the executable in the host
    const hostPath = await firost.shell(`yarn bin ${bin}`);
    if (hostPath) {
      return hostPath;
    }

    // Try in Aberlaas
    const aberlaasPath = await firost.shell(
      `cd ${__dirname} && yarn bin ${bin}`
    );
    if (aberlaasPath) {
      return aberlaasPath;
    }

    return null;
  },

  /**
   * Spawn a subprocess
   * @param {String} command Main command
   * @param {Array} args Arguments to pass to the command
   * @returns {Object} Status object of the command call
   **/
  spawn(command, args) {
    return spawn.sync(command, args, { stdio: 'inherit' });
  },
};
