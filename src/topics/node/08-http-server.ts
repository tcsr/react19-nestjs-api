/**
 * HTTP MODULE (raw Node server)
 * -----------------------------
 * Node's built-in `http` module creates servers/clients with no framework.
 * Express/NestJS are built ON this. Understanding it explains what frameworks do:
 * parse the request stream, route by method+url, write status/headers/body.
 *
 * req is a Readable stream; res is a Writable stream. You must end() the response.
 *
 * Run: npx tsx src/topics/node/08-http-server.ts   (then curl http://localhost:4000)
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // Manual routing by method + url (what Express/Nest automate).
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'hello from raw http' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/echo') {
    // Body arrives as stream chunks — collect then parse.
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ youSent: body }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(4000, () => console.log('raw http server on http://localhost:4000'));
// Ctrl+C to stop. Note: no routing/DI/validation — that's the value frameworks add.
