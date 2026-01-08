import path from 'node:path';
import { exists, glob, readJson } from 'firost';

/**
 * Find all publishable packages in the repository
 * Returns packages where private: false in package.json
 * @returns {Promise<Array<{path: string, name: string, version: string}>>}
 */
async function findPublishable() {
  const rootPkgPath = './package.json';
  const rootPkg = await readJson(rootPkgPath);

  // Case 1: No workspaces = single package at root
  if (!rootPkg.workspaces) {
    if (rootPkg.private) {
      throw new Error(
        'Root package is private (private: true), nothing to publish',
      );
    }
    return [
      {
        path: '.',
        name: rootPkg.name,
        version: rootPkg.version,
      },
    ];
  }

  // Case 2: Workspaces - scan all workspace patterns
  const workspacePatterns = rootPkg.workspaces;
  const allPackages = [];

  for (const pattern of workspacePatterns) {
    const pkgPaths = await glob(`${pattern}/package.json`);

    for (const pkgPath of pkgPaths) {
      const pkg = await readJson(pkgPath);

      // Only include non-private packages
      if (!pkg.private) {
        allPackages.push({
          path: path.dirname(pkgPath),
          name: pkg.name,
          version: pkg.version,
        });
      }
    }
  }

  if (allPackages.length === 0) {
    throw new Error(
      'No publishable packages found (all packages have private: true)',
    );
  }

  return allPackages;
}

export default findPublishable;
