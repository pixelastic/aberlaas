/**
 * What is this file doing?
 *
 * `aberlaas` configures Jest to use the `jest-extended` module to add more
 * matchers. To install it, the `setupFilesAfterEnv` option should contain
 * a path to the module.
 *
 * Because `jest-extended` is a subdependency, it can be installed in two
 * different places:
 *    1. <rootDir>/node_modules/aberlaas/node_modules/jest-extended
 *    2. <rootDir>/node_modules/jest-extended
 * It will be installed in 1. by default, but might sometimes be hoisted to 2.
 * if another module of the host uses it
 *
 * Because of this moving path, no value we would set in `setupFilesAfterEnv`
 * would work 100% of the time.
 *
 * The solution is to use this file as a proxy and reference it in the config.
 * This file will import the correct module and export it back. And this file
 * will never move.
 **/
module.exports = require('jest-extended');
