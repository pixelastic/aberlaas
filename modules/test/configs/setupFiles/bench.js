// We make bench publicly available inside of tests, so users won't need to
// import it
import { bench } from 'vitest';

globalThis.bench = bench;
