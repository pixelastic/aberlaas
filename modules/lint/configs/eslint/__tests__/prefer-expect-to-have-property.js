import { RuleTester } from 'eslint';
import rule from '../rules/prefer-expect-to-have-property.js';

// Wire RuleTester to vitest's test runner
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('aberlaas/prefer-expect-to-have-property', rule, {
  valid: [
    {
      name: 'Accepts expect(a).toEqual(bar) (no member expression)',
      code: 'expect(a).toEqual(bar)',
    },
    {
      name: 'Accepts expect(a.foo).not.toEqual(bar) (.not chain ignored)',
      code: 'expect(a.foo).not.toEqual(bar)',
    },
  ],
  invalid: [
    {
      name: 'Flags expect(a.foo).toEqual(bar) and fixes to expect(a).toHaveProperty',
      code: 'expect(a.foo).toEqual(bar)',
      output: "expect(a).toHaveProperty('foo', bar)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(response.status).toEqual(200) with any variable name',
      code: 'expect(response.status).toEqual(200)',
      output: "expect(response).toHaveProperty('status', 200)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
  ],
});
