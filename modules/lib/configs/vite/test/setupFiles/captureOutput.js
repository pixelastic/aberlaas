// We make captureOutput publicly available inside of tests
import { captureOutput } from 'firost';

globalThis.captureOutput = captureOutput;
