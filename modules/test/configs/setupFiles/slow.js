// Add .slow() method to it/test/describe for tests that need more time
import { vi } from 'vitest';

const SLOW_TEST_TIMEOUT = 30_000;

// Wrapper for it.slow()
globalThis.it.slow = (name, callback, timeout = SLOW_TEST_TIMEOUT) => {
  return globalThis.it(name, callback, timeout);
};

// Wrapper for describe.slow()
globalThis.describe.slow = (name, callback) => {
  return globalThis.describe(name, () => {
    vi.setConfig({ testTimeout: SLOW_TEST_TIMEOUT });
    callback();
  });
};
