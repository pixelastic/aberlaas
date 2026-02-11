// Add .slow() method to it/test/describe for tests that need more time
import { vi } from 'vitest';
import { slowPrefix, slowTimeout } from '../../configs/slow.js';

// Wrapper for it.slow()
globalThis.it.slow = (name, callback, timeout = slowTimeout) => {
  return globalThis.it(`${slowPrefix}${name}`, callback, timeout);
};

// Wrapper for describe.slow()
globalThis.describe.slow = (name, callback) => {
  return globalThis.describe(`${slowPrefix}${name}`, () => {
    vi.setConfig({ testTimeout: slowTimeout });
    callback();
  });
};
