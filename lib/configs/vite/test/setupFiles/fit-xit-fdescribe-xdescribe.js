/**
 * Add faster to type aliases:
 * - fit, ftest, fdescribe: To focus specific tests
 * - xit, xtest, xdescribe: To skip specific tests
 **/

globalThis.fit = globalThis.it.only;
globalThis.ftest = globalThis.test.only;
globalThis.fdescribe = globalThis.describe.only;

globalThis.xit = globalThis.it.skip;
globalThis.xtest = globalThis.test.skip;
globalThis.xdescribe = globalThis.describe.skip;
