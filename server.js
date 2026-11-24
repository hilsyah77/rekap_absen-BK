const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3050;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const DB_BACKUP_FILE = path.join(DATA_DIR, 'database.backup.json');
const MAX_BODY_BYTES = 25 * 1024 * 1024; // 25 MB (mendukung logo sekolah & data multi-tahun)

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readDatabaseFile() {
  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeDatabaseFileAtomic(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
    } catch (e) {
      console.warn('Warning: gagal membuat backup sebelum simpan:', e.message);
    }
  }
  const payload = Object.assign({}, data, { serverSavedAt: new Date().toISOString() });
  const tmpFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
  return payload.serverSavedAt;
}

function serveStaticFile(reqPath, res) {
  let cleanPath = decodeURIComponent(reqPath.split('?')[0]);
  if (cleanPath === '/' || cleanPath === '') {
    cleanPath = '/index.html';
  }

  // Blokir akses langsung ke folder sensitif & file server
  const blockedPrefixes = ['/data', '/.git', '/node_modules', '/dist'];
  const blockedFiles = ['/server.js', '/main.js', '/preload.js', '/package.json', '/package-lock.json', '/.gitignore'];
  if (
    blockedPrefixes.some(p => cleanPath === p || cleanPath.startsWith(p + '/')) ||
    blockedFiles.includes(cleanPath)
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const safePath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(ROOT_DIR, safePath);
  if (!fullPath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    fs.createReadStream(fullPath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  // Health Check
  if (req.method === 'GET' && urlPath === '/api/health') {
    let updatedAt = null;
    const hasDatabase = fs.existsSync(DB_FILE);
    if (hasDatabase) {
      try {
        updatedAt = fs.statSync(DB_FILE).mtime.toISOString();
      } catch (e) {}
    }
    return sendJson(res, 200, { ok: true, hasDatabase, updatedAt });
  }

  // Load Database
  if (req.method === 'GET' && urlPath === '/api/database') {
    try {
      const data = readDatabaseFile();
      if (!data) {
        return sendJson(res, 200, { exists: false, data: null });
      }
      return sendJson(res, 200, { exists: true, data });
    } catch (err) {
      console.error('Gagal membaca database:', err);
      return sendJson(res, 500, { ok: false, error: 'Gagal membaca database server.' });
    }
  }

  // Save Database
  if (req.method === 'POST' && urlPath === '/api/database') {
    let body = '';
    let size = 0;
    let aborted = false;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        aborted = true;
        sendJson(res, 413, { ok: false, error: 'Ukuran data melebihi batas 25 MB.' });
        req.destroy();
        return;
      }
      body += chunk.toString('utf8');
    });

    req.on('end', () => {
      if (aborted) return;
      try {
        const parsed = JSON.parse(body);
        if (!parsed || typeof parsed !== 'object') {
          return sendJson(res, 400, { ok: false, error: 'Format JSON database tidak valid.' });
        }
        const savedAt = writeDatabaseFileAtomic(parsed);
        return sendJson(res, 200, { ok: true, savedAt });
      } catch (err) {
        console.error('Gagal menyimpan database:', err);
        return sendJson(res, 400, { ok: false, error: 'Gagal memproses atau menyimpan database: ' + err.message });
      }
    });
    return;
  }

  // Static Files
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStaticFile(req.url || '/', res);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`[Absensi BK Server] Berjalan di http://${HOST}:${PORT}`);
  console.log(`[Absensi BK Server] Lokasi Database: ${DB_FILE}`);
});
