const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.join(__dirname, 'bhanuswamiarchives.net');
// Load pre-built ID map (built by scanning body classes in all downloaded HTML files)
const pageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'id-map.json'), 'utf8'));
console.log(`Loaded ${Object.keys(pageMap).length} page/post ID mappings`);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.xml': 'text/xml',
  '.txt': 'text/plain',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsed.pathname);

  // Handle ?p=XXX WordPress redirects (browser decodes %3F→? so query arrives as p=3746.html)
  if (parsed.query.p) {
    const pageId = String(parsed.query.p).replace(/\.html$/, '');
    const target = pageMap[pageId];
    if (target) {
      res.writeHead(302, { Location: target });
      res.end();
      return;
    }
  }

  // Try exact file
  let filePath = path.join(ROOT, pathname);

  // If directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If no extension, try /index.html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    filePath = path.join(ROOT, pathname, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    serveFile(res, filePath);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<h2>Page not found</h2><p>${pathname}</p>`);
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Bhanu Swami Archives running at http://localhost:${PORT}`);
});
