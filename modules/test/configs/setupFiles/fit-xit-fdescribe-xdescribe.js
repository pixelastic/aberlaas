/**
 * Add faster to type aliases:
 * - fit, fdescribe: To focus specific tests
 * - xit, xdescribe: To skip specific tests
 */

globalThis.fit = globalThis.it.only;
globalThis.fdescribe = globalThis.describe.only;

globalThis.xit = globalThis.it.skip;
globalThis.xdescribe = globalThis.describe.skip;
