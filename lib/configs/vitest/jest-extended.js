// We use extended matchers from jest-extended in vitest
// It includes matcher like .toStartWith, .toBeEmpty, etc
// See: https://github.com/jest-community/jest-extended
//
// The expect.extend() from Vitest is compatible with the one from Jest, so
// setup is straightforward
import { expect } from 'vitest';
import * as matchers from 'jest-extended';

expect.extend(matchers);
