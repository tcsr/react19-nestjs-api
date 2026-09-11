/**
 * NODE MODULES: CommonJS vs ES Modules
 * ------------------------------------
 * Node has two module systems:
 *
 * CommonJS (CJS) — the legacy default:
 *   const x = require('x');  module.exports = {...};
 *   - Synchronous, loaded at runtime; `require` can be called conditionally.
 *   - Has __dirname, __filename, and a live `module`/`exports` object.
 *
 * ES Modules (ESM) — the standard (this project uses ESM: "type":"module"):
 *   import x from 'x';  export const y = ...;  export default ...;
 *   - Static: imports are hoisted and resolved before execution; enables tree-
 *     shaking; top-level await allowed.
 *   - Relative imports need a file EXTENSION (./foo.js) under NodeNext.
 *   - No __dirname/__filename by default — derive from import.meta.url.
 *
 * Interop: ESM can import CJS (default import); CJS importing ESM needs dynamic
 * import(). Pick one per package via package.json "type".
 *
 * Run: npx tsx src/topics/node/02-modules.ts
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ESM replacements for __filename / __dirname:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('ESM file :', __filename);
console.log('ESM dir  :', __dirname);

// Dynamic import (works in both systems; returns a promise → conditional/lazy).
const os = await import('node:os');
console.log('platform :', os.platform());
