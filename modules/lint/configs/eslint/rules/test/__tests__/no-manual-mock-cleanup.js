import ruleTester from '../../helpers/ruleTester.js';
import rule from '../no-manual-mock-cleanup.js';

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
