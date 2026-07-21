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
    {
      name: 'Flags expect(a.foo.bar).toEqual(baz) with nested dot path',
      code: 'expect(a.foo.bar).toEqual(baz)',
      output: "expect(a).toHaveProperty('foo.bar', baz)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: "Flags expect(a['foo']).toEqual(bar) with bracket string literal",
      code: "expect(a['foo']).toEqual(bar)",
      output: "expect(a).toHaveProperty('foo', bar)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(a[key]).toEqual(bar) with bracket variable',
      code: 'expect(a[key]).toEqual(bar)',
      output: 'expect(a).toHaveProperty(key, bar)',
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(a[key].foo).toBe(bar) with mixed chain (array format)',
      code: 'expect(a[key].foo).toBe(bar)',
      output: "expect(a).toHaveProperty([key, 'foo'], bar)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(a.foo[key]).toEqual(bar) with mixed chain (array format)',
      code: 'expect(a.foo[key]).toEqual(bar)',
      output: "expect(a).toHaveProperty(['foo', key], bar)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
    {
      name: 'Flags expect(a.foo.bar.baz).toEqual(x) with deeply nested dot path',
      code: 'expect(a.foo.bar.baz).toEqual(x)',
      output: "expect(a).toHaveProperty('foo.bar.baz', x)",
      errors: [{ messageId: 'preferToHaveProperty' }],
    },
  ],
});
