import { encodePackageName } from './encodePackageName.js';

export let __;

/**
 * Check if a package has never been published to npm
 * @param {string} packageName - npm package name (may be scoped)
 * @returns {Promise<boolean>} True if the package has never been published
 */
export async function isFirstPublish(packageName) {
  const encodedName = encodePackageName(packageName);
  const url = `https://registry.npmjs.org/${encodedName}`;
  const response = await __.fetch(url, { method: 'HEAD' });

  return response.status === 404;
}

__ = {
  fetch,
};
