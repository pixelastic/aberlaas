import ruleTester from '../../helpers/ruleTester.js';
import rule from '../prefer-mock-return-value.js';

ruleTester.run('aberlaas/prefer-mock-return-value', rule, {
  valid: [
    {
      name: 'should allow mockReturnValue',
      code: 'mock.mockReturnValue(42)',
    },
    {
      name: 'should allow mockReturnValueOnce',
      code: 'mock.mockReturnValueOnce(42)',
    },
    {
      name: 'should allow mockImplementation',
      code: 'mock.mockImplementation(() => 42)',
    },
  ],
  invalid: [
    {
      name: 'should report and fix mockResolvedValue to mockReturnValue',
      code: 'mock.mockResolvedValue(42)',
      output: 'mock.mockReturnValue(42)',
      errors: [{ messageId: 'preferMockReturnValue' }],
    },
    {
      name: 'should report and fix mockResolvedValueOnce to mockReturnValueOnce',
      code: 'mock.mockResolvedValueOnce(42)',
      output: 'mock.mockReturnValueOnce(42)',
      errors: [{ messageId: 'preferMockReturnValueOnce' }],
    },
    {
      name: 'should report and fix mockRejectedValue to mockReturnValue',
      code: 'mock.mockRejectedValue(new Error())',
      output: 'mock.mockReturnValue(new Error())',
      errors: [{ messageId: 'preferMockReturnValue' }],
    },
    {
      name: 'should report and fix mockRejectedValueOnce to mockReturnValueOnce',
      code: 'mock.mockRejectedValueOnce(new Error())',
      output: 'mock.mockReturnValueOnce(new Error())',
      errors: [{ messageId: 'preferMockReturnValueOnce' }],
    },
  ],
});
