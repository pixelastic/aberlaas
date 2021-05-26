/* eslint-disable jest/no-jasmine-globals,no-global-assign */
const captureOutput = require('firost/captureOutput');
const dedent = require('dedent');

/**
 * Add new globals to each test file:
 * - captureOutput accepts a callback that will be executed with all output
 *   silenced and returned instead
 * - dedent (https://github.com/dmnd/dedent) to enter multiline strings without
 *   the indentation
 **/
global.captureOutput = captureOutput;
global.dedent = dedent;
