/**
 * FILE SYSTEM & PATH
 * ------------------
 * node:fs — read/write files. Prefer the promise API (fs/promises) with async/await
 * over sync (blocks the loop) or callbacks. Stream large files (see 05-streams).
 * node:path — build/parse paths cross-platform (use path.join, never string concat
 * with '/'). node:os — platform info, tmpdir, cpus.
 *
 * Run: npx tsx src/topics/node/10-fs-path.ts
 */

import { mkdir, writeFile, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join, dirname, extname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// path helpers (no I/O)
console.log('join   :', join('a', 'b', '..', 'c')); // a/c
console.log('ext    :', extname('report.2024.pdf')); // .pdf
console.log('base   :', basename('/x/y/file.txt')); // file.txt
console.log('thisDir:', __dirname);

async function main() {
  const dir = join(tmpdir(), 'node-fs-demo');
  const file = join(dir, 'note.txt');

  await mkdir(dir, { recursive: true }); // recursive = mkdir -p
  await writeFile(file, 'line 1\nline 2\n', 'utf8');

  const content = await readFile(file, 'utf8');
  console.log('read   :', JSON.stringify(content));

  const info = await stat(file);
  console.log('size   :', info.size, 'bytes | isFile:', info.isFile());

  console.log('dirList:', await readdir(dir));

  await rm(dir, { recursive: true, force: true }); // cleanup
  console.log('cleaned up');
}

await main();
