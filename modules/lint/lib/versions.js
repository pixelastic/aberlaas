import { _ } from 'golgoth';
import { firostError, readJson } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import { yarnVersion } from 'aberlaas-versions';

export let __;

/**
 * Check that version fields in project files match expected values
 * @returns {boolean} True when all versions match
 */
export async function run() {
  const mismatches = await __.findMismatches();

  if (_.isEmpty(mismatches)) {
    return true;
  }

  const summary = mismatches
    .map(({ file, field, actual, expected }) => {
      return `  ${file}#${field}: ${actual} → ${expected}`;
    })
    .join('\n');
  const message = `Version mismatch:\n${summary}`;
  throw firostError('ABERLAAS_LINT_VERSIONS', message);
}

/**
 * Fix version mismatches (no-op for now, delegates to run)
 * @returns {boolean} True when all versions match
 */
export async function fix() {
  return await run();
}

__ = {
  /**
   * Collect all version mismatches
   * @returns {object[]} Array of { file, field, actual, expected }
   */
  async findMismatches() {
    const mismatches = [];

    const packageJsonPath = await hostGitPath('package.json');
    const packageJson = await readJson(packageJsonPath);
    const expectedPackageManager = `yarn@${yarnVersion}`;
    const actualPackageManager = packageJson.packageManager || undefined;

    if (actualPackageManager !== expectedPackageManager) {
      mismatches.push({
        file: 'package.json',
        field: 'packageManager',
        actual: actualPackageManager || '(missing)',
        expected: expectedPackageManager,
      });
    }

    return mismatches;
  },
};

export default {
  run,
  fix,
};
