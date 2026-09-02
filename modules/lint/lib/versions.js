import { _ } from 'golgoth';
import { exists, firostError, read, readJson } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import { nodeVersion, yarnVersion } from 'aberlaas-versions';

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
      const label = field ? `${file}#${field}` : file;
      return `  ${label}: ${actual} → ${expected}`;
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
    const actualPackageManager = packageJson.packageManager;

    if (actualPackageManager !== expectedPackageManager) {
      mismatches.push({
        file: 'package.json',
        field: 'packageManager',
        actual: actualPackageManager || '(missing)',
        expected: expectedPackageManager,
      });
    }

    // engines.node
    const expectedEnginesNode = `>=${nodeVersion}`;
    const actualEnginesNode = _.get(packageJson, 'engines.node');
    if (actualEnginesNode !== expectedEnginesNode) {
      mismatches.push({
        file: 'package.json',
        field: 'engines.node',
        actual: actualEnginesNode || '(missing)',
        expected: expectedEnginesNode,
      });
    }

    // .nvmrc (skip if file does not exist)
    const nvmrcPath = await hostGitPath('.nvmrc');
    if (await exists(nvmrcPath)) {
      const actualNvmrc = _.trim(await read(nvmrcPath));
      if (actualNvmrc !== nodeVersion) {
        mismatches.push({
          file: '.nvmrc',
          actual: actualNvmrc,
          expected: nodeVersion,
        });
      }
    }

    // .circleci/config.yml (skip if file does not exist)
    const circleCiPath = await hostGitPath('.circleci/config.yml');
    if (await exists(circleCiPath)) {
      const circleCiContent = await read(circleCiPath);

      // cimg/node pattern
      const cimgMatch = circleCiContent.match(/cimg\/node:(\S+)/);
      if (cimgMatch) {
        const actualCimg = `cimg/node:${cimgMatch[1]}`;
        const expectedCimg = `cimg/node:${nodeVersion}`;
        if (actualCimg !== expectedCimg) {
          mismatches.push({
            file: '.circleci/config.yml',
            actual: actualCimg,
            expected: expectedCimg,
          });
        }
      }

      // yarn set version pattern
      const yarnSetMatch = circleCiContent.match(/yarn set version (\S+)/);
      if (yarnSetMatch) {
        const actualYarnSet = `yarn set version ${yarnSetMatch[1]}`;
        const expectedYarnSet = `yarn set version ${yarnVersion}`;
        if (actualYarnSet !== expectedYarnSet) {
          mismatches.push({
            file: '.circleci/config.yml',
            actual: actualYarnSet,
            expected: expectedYarnSet,
          });
        }
      }
    }

    return mismatches;
  },
};

export default {
  run,
  fix,
};
