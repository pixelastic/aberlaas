// We extend the test config with vite.globalSetup.js config file
import path from 'node:path';
import * as url from 'node:url';
import config from './modules/lib/configs/vite.js';

const rootPath = url.fileURLToPath(new URL('.', import.meta.url));
const globalSetupFile = path.resolve(rootPath, 'vite.globalSetup.js');

config.test.globalSetup = globalSetupFile;

export default config;
