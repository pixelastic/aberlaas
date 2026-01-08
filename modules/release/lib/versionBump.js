import path from 'node:path';
import { exists, readJson, writeJson } from 'firost';

/**
 * Update version in all package.json files
 * Uses fixed versioning: all packages get the same version
 * @param {Array<{path: string, name: string, version: string}>} packages Packages to update
 * @param {string} newVersion New version number
 * @returns {Promise<void>}
 */
async function updateAll(packages, newVersion) {
  // Update all workspace packages
  for (const pkg of packages) {
    const pkgPath = path.join(pkg.path, 'package.json');
    const content = await readJson(pkgPath);
    content.version = newVersion;
    await writeJson(pkgPath, content);
  }

  // Also update root package.json version if it exists
  const rootPkgPath = './package.json';
  if (await exists(rootPkgPath)) {
    const rootPkg = await readJson(rootPkgPath);
    rootPkg.version = newVersion;
    await writeJson(rootPkgPath, rootPkg);
  }
}

export default updateAll;
