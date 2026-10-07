/**
 * Encode a package name for use in npm registry URLs
 * Scoped packages need the slash encoded but not the @
 * @param {string} packageName - npm package name (may be scoped, e.g. @scope/name)
 * @returns {string} Encoded package name safe for registry URLs
 */
export function encodePackageName(packageName) {
  return packageName.replace('/', '%2f');
}
