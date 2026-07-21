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
    {
      name: 'Accepts expect(a.foo).toContain(x) (unhandled matcher)',
      code: "expect(a.foo).toContain('x')",
    },
    {
      name: 'Accepts expect(a.foo).toHaveLength(3) (unhandled matcher)',
      code: 'expect(a.foo).toHaveLength(3)',
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
    {
      name: 'Flags expect(a.foo).toBe(bar) and fixes to toHaveProperty',
      code: 'expect(a.foo).toBe(bar)',
      output: "expect(a).toHaveProperty('foo', bar)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(a.foo).toBeDefined() and fixes to toHaveProperty with no value',
      code: 'expect(a.foo).toBeDefined()',
      output: "expect(a).toHaveProperty('foo')",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
  ],
});
