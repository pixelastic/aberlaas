/**
 * In July 2021, I moved the repository to a monorepo holding the docs. The path
 * to the config files changed, no longer referencing the ./lib. This break all
 * usage, so I added this proxy, with a deprecation notice.
 *
 * Require the correct file, but display a warning about what file to change
 * @param {string} hostPath Example: jest.config.js
 * @param {string} aberlaasPath Example configs/jest.js
 * @returns {object} Config file object
 **/
module.exports = (hostPath, aberlaasPath) => {
  console.info(
    `Please update your ${hostPath} to require aberlaas/${aberlaasPath} instead of aberlaas/lib/${aberlaasPath}`
  );

  return require(`../../${aberlaasPath}`);
};
