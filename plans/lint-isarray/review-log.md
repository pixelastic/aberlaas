## Issue 01 — Consolidate prefer-lodash rules
### Spec: "splits from/to on `.`" structural deviation
```javascript
const calleeName = `${callee.object.name}.${callee.property.name}`;
const match = methods.find((m) => m.from === calleeName);
```
**Problem:** Spec says rule should "split `from`/`to` on `.` to extract object and method names" but implementation builds callee string and matches against unsplit `from` value.
**Reason skipped:** Functionally equivalent — same inputs, same outputs, same autofix. Spec described intent, not mandated implementation.
