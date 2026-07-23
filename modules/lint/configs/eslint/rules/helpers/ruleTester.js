import { RuleTester } from 'eslint';

// Wire RuleTester to vitest's test runner
/* eslint-disable no-undef */
RuleTester.describe = describe;
RuleTester.it = it;
/* eslint-enable no-undef */

export default new RuleTester();
