import semver from 'semver';
import preChecks from './preChecks.js';
import detectPackages from './detectPackages.js';
import versionBump from './versionBump.js';
import changelog from './changelog.js';
import * as gitOps from './gitOps.js';
import publish from './publish.js';

/**
 * Release command: bump version, generate changelog, and publish to npm
 * @param {object} options Command options
 * @param {Array<string>} options._ Positional arguments [bump-type]
 * @param {boolean} options.skipTest Skip test execution
 * @param {boolean} options.skipLint Skip lint execution
 * @returns {Promise<void>}
 */
async function run(options = {}) {
  const bump = options._?.[0]; // 'patch', 'minor', 'major'

  // Validate bump argument
  if (!bump || !['patch', 'minor', 'major'].includes(bump)) {
    throw new Error(
      'Usage: aberlaas release [patch|minor|major]\n\n' +
        'Examples:\n' +
        '  aberlaas release patch   # 1.0.0 → 1.0.1\n' +
        '  aberlaas release minor   # 1.0.0 → 1.1.0\n' +
        '  aberlaas release major   # 1.0.0 → 2.0.0\n\n' +
        'Options:\n' +
        '  --skip-test  Skip test execution\n' +
        '  --skip-lint  Skip lint execution',
    );
  }

  console.log(`\n🚀 Starting ${bump} release...\n`);

  // 1. Pre-checks
  console.log('📋 Running pre-checks...');
  await preChecks(options);
  console.log('✓ Pre-checks passed\n');

  // 2. Detect publishable packages
  console.log('📦 Detecting packages...');
  const packages = await detectPackages();
  console.log(`Found ${packages.length} package(s) to publish:`);
  for (const pkg of packages) {
    console.log(`  - ${pkg.name}@${pkg.version}`);
  }
  console.log('');

  // 3. Calculate new version
  const currentVersion = packages[0].version;
  const newVersion = semver.inc(currentVersion, bump);
  console.log(`📈 Version: ${currentVersion} → ${newVersion}\n`);

  // 4. Create temp branch
  console.log('🌿 Creating temporary branch...');
  await gitOps.createTempBranch(newVersion);
  console.log(`✓ Created branch: temp/release-v${newVersion}\n`);

  try {
    // 5. Bump versions
    console.log('🔢 Updating versions...');
    await versionBump(packages, newVersion);
    console.log('✓ Versions updated\n');

    // 6. Generate changelog
    console.log('📝 Generating changelog...');
    await changelog(newVersion);
    console.log('✓ Changelog generated\n');

    // 7. Commit changes
    console.log('💾 Committing changes...');
    await gitOps.commitRelease(newVersion);
    console.log('✓ Changes committed\n');

    // 8. Publish to npm
    console.log('📤 Publishing to npm...\n');
    await publish(packages);
    console.log('\n✓ All packages published\n');

    // 9. SUCCESS: finalize
    console.log('🎯 Finalizing release...');
    await gitOps.finalize(newVersion);
    console.log('✓ Release finalized\n');

    console.log(`\n✨ Release v${newVersion} completed successfully!\n`);
  } catch (error) {
    console.error(`\n❌ Release failed: ${error.message}\n`);

    // 10. FAILURE: cleanup
    console.log('🔄 Rolling back changes...');
    await gitOps.cleanup(newVersion);
    console.log('✓ Cleanup completed\n');

    throw error;
  }
}

export default run;
