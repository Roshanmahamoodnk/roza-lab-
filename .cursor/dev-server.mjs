// Development-only static file server with an /api/* reverse proxy.
// Serves the static Rozalab × Carino site and forwards /api/* requests to the
// standalone assistant server (assistant-server.js) so the frontend can call
// /api/assistant on a single origin, mirroring the Vercel production topology.
// Uses only Node.js built-ins so it needs no extra dependencies.

import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const WEB_PORT = Number(process.env.WEB_PORT || 8080);
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:3000';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function proxyApi(req, res) {
  const target = new URL(req.url, API_TARGET);
  const proxyReq = http.request(
    target,
    { method: req.method, headers: { ...req.headers, host: target.host } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Assistant API unreachable', message: err.message }));
  });
  req.pipe(proxyReq);
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let relPath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (relPath === '/' || relPath === '' || relPath.endsWith('/')) {
    relPath = join(relPath, 'index.html');
  }
  let filePath = join(ROOT, relPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    let info = await stat(filePath);
    if (info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath);
    }
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-cache',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1>');
  }
}

const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/api/')) {
    proxyApi(req, res);
  } else {
    serveStatic(req, res).catch((err) => {
      res.writeHead(500).end(String(err));
    });
  }
});

server.listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`Rozalab web dev server on http://0.0.0.0:${WEB_PORT} (proxying /api -> ${API_TARGET})`);
});
