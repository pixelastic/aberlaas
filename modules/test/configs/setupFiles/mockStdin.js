import { PassThrough } from 'node:stream';

/**
 * Allow mocking stdin in tests.
 * Usage:
 * mockStdin((stdin) => {
 *   // do something
 *   stdin.push('abc');
 * });
 * Initial code inspired by: https://github.com/sindresorhus/ora/blob/main/test.js
 * @param {Function} callback Method called with a fake stdin as first argument
 * @returns {any} Return value of the callback
 **/
globalThis.mockStdin = function (callback) {
  const originalStdinDescriptor = Object.getOwnPropertyDescriptor(
    process,
    'stdin',
  );

  const fakeStdin = new PassThrough();
  fakeStdin.isTTY = true;
  fakeStdin.isRaw = false;
  fakeStdin.setRawMode = (value) => {
    fakeStdin.isRaw = value;
  };

  Object.defineProperty(process, 'stdin', {
    value: fakeStdin,
    configurable: true,
  });

  try {
    return callback(fakeStdin);
  } finally {
    Object.defineProperty(process, 'stdin', originalStdinDescriptor);
  }
};
