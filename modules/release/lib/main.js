import { firostError } from 'firost';
import { _ } from 'golgoth';
import { ensureValidRepository } from './ensureValidRepository.js';
// import semver from 'semver';
// import preChecks from './preChecks.js';
// import detectPackages from './detectPackages.js';
// import versionBump from './versionBump.js';
// import changelog from './changelog.js';
// import * as gitOps from './gitOps.js';
// import publish from './publish.js';

export default {
  /**
   * Wrapper to release the current module(s)
   * @param {object} cliArgs CLI Argument object, as created by minimist
   * @returns {boolean} True on success
   */
  async run(cliArgs = {}) {
    const bumpType = cliArgs._[0]; // major/minor/patch

    if (!_.includes(['patch', 'minor', 'major'], bumpType)) {
      throw firostError(
        'ABERLAAS_RELEASE_UNKNOWN_BUMP_TYPE',
        'Bump type should be either major, minor or patch',
      );
    }

    await ensureValidRepository(cliArgs);

    // // 2. Detect publishable packages
    // console.log('📦 Detecting packages...');
    // const packages = await detectPackages();
    // console.log(`Found ${packages.length} package(s) to publish:`);
    // for (const pkg of packages) {
    //   console.log(`  - ${pkg.name}@${pkg.version}`);
    // }
    // console.log('');
    //
    // // 3. Calculate new version
    // const currentVersion = packages[0].version;
    // const newVersion = semver.inc(currentVersion, bump);
    // console.log(`📈 Version: ${currentVersion} → ${newVersion}\n`);
    //
    // // 4. Create temp branch
    // console.log('🌿 Creating temporary branch...');
    // await gitOps.createTempBranch(newVersion);
    // console.log(`✓ Created branch: temp/release-v${newVersion}\n`);
    //
    // try {
    //   // 5. Bump versions
    //   console.log('🔢 Updating versions...');
    //   await versionBump(packages, newVersion);
    //   console.log('✓ Versions updated\n');
    //
    //   // 6. Generate changelog
    //   console.log('📝 Generating changelog...');
    //   await changelog(newVersion);
    //   console.log('✓ Changelog generated\n');
    //
    //   // 7. Commit changes
    //   console.log('💾 Committing changes...');
    //   await gitOps.commitRelease(newVersion);
    //   console.log('✓ Changes committed\n');
    //
    //   // 8. Publish to npm
    //   console.log('📤 Publishing to npm...\n');
    //   await publish(packages);
    //   console.log('\n✓ All packages published\n');
    //
    //   // 9. SUCCESS: finalize
    //   console.log('🎯 Finalizing release...');
    //   await gitOps.finalize(newVersion);
    //   console.log('✓ Release finalized\n');
    //
    //   console.log(`\n✨ Release v${newVersion} completed successfully!\n`);
    // } catch (error) {
    //   console.error(`\n❌ Release failed: ${error.message}\n`);
    //
    //   // 10. FAILURE: cleanup
    //   console.log('🔄 Rolling back changes...');
    //   await gitOps.cleanup(newVersion);
    //   console.log('✓ Cleanup completed\n');
    //
    //   throw error;
    // }
  },
};
