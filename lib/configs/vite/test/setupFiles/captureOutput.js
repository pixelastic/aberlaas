// We make captureOutput publicly available inside of tests
import captureOutput from 'firost/captureOutput.js';

globalThis.captureOutput = captureOutput;
