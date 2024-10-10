#!/usr/bin/env node
import aberlaas from '../lib/main.js';

(async () => {
  await aberlaas.run(process.argv.slice(2));
})();
