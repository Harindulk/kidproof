// Local stand-in for Vercel: serves public/ and routes /api/check. node --env-file-if-exists=.env server/dev.js
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { Readable } from 'node:stream';
import * as check from '../api/check.js';

const root = new URL('../public/', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/check' && req.method === 'POST') {
    const response = await check.POST(new Request(url, { method: 'POST', headers: req.headers, body: Readable.toWeb(req), duplex: 'half' }));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  const path = normalize(join(root, url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname));
  if (!path.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(path);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(process.env.PORT || 8790, () => console.log(`Kidproof on http://localhost:${process.env.PORT || 8790}`));
