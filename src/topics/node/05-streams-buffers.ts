/**
 * STREAMS & BUFFERS
 * -----------------
 * BUFFER: a fixed-length chunk of raw binary bytes (Uint8Array subclass). Node
 * represents binary data (files, network) as Buffers.
 *
 * STREAM: process data piece-by-piece instead of loading it all in memory —
 * essential for large files/network. Four types:
 *   Readable  — source you read from (fs.createReadStream, req)
 *   Writable  — sink you write to (fs.createWriteStream, res)
 *   Duplex    — both (TCP socket)
 *   Transform — Duplex that transforms as it passes (gzip, hashing)
 *
 * BACKPRESSURE: pipe()/pipeline() automatically pause the source when the sink is
 * slow, preventing memory blowup. Prefer pipeline() (handles errors + cleanup).
 *
 * Run: npx tsx src/topics/node/05-streams-buffers.ts
 */

import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// Buffer basics
const buf = Buffer.from('héllo', 'utf8');
console.log('bytes:', buf.length, 'hex:', buf.toString('hex'));

// Readable source from an array
const source = Readable.from(['one ', 'two ', 'three']);

// Transform: uppercase each chunk
const upper = new Transform({
  transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  },
});

// Writable sink: collect output
let out = '';
const sink = new (await import('node:stream')).Writable({
  write(chunk, _enc, cb) {
    out += chunk.toString();
    cb();
  },
});

// pipeline wires source -> transform -> sink with backpressure + error handling
await pipeline(source, upper, sink);
console.log('piped result:', out);
