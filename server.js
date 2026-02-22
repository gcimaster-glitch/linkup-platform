const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  
  // Decode URL
  try { pathname = decodeURIComponent(pathname); } catch(e) {}
  
  // Resolve file path
  let filePath = path.join(ROOT, pathname);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  
  // Try to serve static file
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  
  // SPA fallback: serve index.html for all non-file routes
  const indexPath = path.join(ROOT, 'index.html');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(indexPath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`LinkUp SPA Server running on port ${PORT}`);
});
