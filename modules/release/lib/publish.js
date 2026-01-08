import path from 'node:path';
import { run } from 'firost';

/**
 * Publish all packages to npm
 * @param {Array<{path: string, name: string, version: string}>} packages Packages to publish
 * @returns {Promise<void>}
 */
async function publishAll(packages) {
  for (const pkg of packages) {
    console.log(`Publishing ${pkg.name}@${pkg.version}...`);

    const cwd = path.resolve(pkg.path);

    try {
      await run('npm publish --access public', { cwd });
      console.log(`✓ ${pkg.name} published successfully`);
    } catch (error) {
      throw new Error(`Failed to publish ${pkg.name}: ${error.message}`);
    }
  }
}

export default publishAll;
