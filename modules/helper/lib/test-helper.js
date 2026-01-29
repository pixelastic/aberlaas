import { __ as helper } from './helper.js';
/**
 * Safely mock aberlaas helper functions to point to a test directory.
 * This prevents tests from accidentally modifying the real aberlaas repository.
 * All helper path functions (hostGitRoot, hostPackageRoot, hostWorkingDirectory)
 * will point to the same test directory as a safety measure.
 * You can override specific paths afterwards if needed.
 * @param {string} testDirectory - Absolute path to test directory
 */
export function mockHelperPaths(testDirectory) {
  /* eslint-disable no-undef */
  vi.spyOn(helper, 'hostGitRoot').mockReturnValue(testDirectory);
  vi.spyOn(helper, 'hostPackageRoot').mockReturnValue(`${testDirectory}/lib`);
  vi.spyOn(helper, 'hostWorkingDirectory').mockReturnValue(
    `${testDirectory}/lib/src`,
  );
  /* eslint-enable no-undef */
}
