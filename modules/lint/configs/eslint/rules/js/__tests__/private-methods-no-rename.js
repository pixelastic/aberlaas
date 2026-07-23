import ruleTester from '../../helpers/ruleTester.js';
import rule from '../private-methods-no-rename.js';

ruleTester.run('aberlaas/private-methods-no-rename', rule, {
  valid: [
    {
      name: 'Same-name shorthand property is not flagged',
      code: '__ = { readGamelist };',
    },
    {
      name: 'Arrow function value is not flagged',
      code: '__ = { readGamelist: () => readRemoteGamelist() };',
    },
    {
      name: 'Call expression value is not flagged',
      code: '__ = { readGamelist: readRemoteGamelist() };',
    },
    {
      name: 'Computed property with different identifier is not flagged',
      code: '__ = { [readGamelist]: readRemoteGamelist };',
    },
    {
      name: 'Properties outside __ = { ... } are not flagged',
      code: 'const obj = { readGamelist: readRemoteGamelist };',
    },
    {
      name: 'undefined value is not flagged',
      code: '__ = { useRam: undefined };',
    },
    {
      name: 'NaN value is not flagged',
      code: '__ = { useRam: NaN };',
    },
    {
      name: 'Infinity value is not flagged',
      code: '__ = { useRam: Infinity };',
    },
  ],
  invalid: [
    {
      name: 'Renamed identifier reports correct message',
      code: '__ = { readGamelist: readRemoteGamelist };',
      output: null,
      errors: [
        {
          messageId: 'noRename',
          data: { valueName: 'readRemoteGamelist' },
        },
      ],
    },
  ],
});
