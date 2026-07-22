import { RuleTester } from 'eslint';
import rule from '../rules/no-manual-mock-cleanup.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/no-manual-mock-cleanup', rule, {
  valid: [
    {
      name: 'should allow restoreAllMocks on objects other than vi',
      code: 'myObj.restoreAllMocks();',
    },
  ],
  invalid: [
    {
      name: 'should report restoreAllMocks with restoreMocks message',
      code: 'vi.restoreAllMocks();',
      errors: [{ messageId: 'restoreAllMocks' }],
    },
    {
      name: 'should report clearAllMocks with clearMocks message',
      code: 'vi.clearAllMocks();',
      errors: [{ messageId: 'clearAllMocks' }],
    },
    {
      name: 'should report resetAllMocks with restoreMocks message',
      code: 'vi.resetAllMocks();',
      errors: [{ messageId: 'resetAllMocks' }],
    },
  ],
});
