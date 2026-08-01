const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const CSV_PATH = path.join(__dirname, 'inbox.csv');

// Ensure CSV file exists with headers and UTF-8 BOM
if (!fs.existsSync(CSV_PATH)) {
  fs.writeFileSync(CSV_PATH, "\uFEFFTimestamp,Date,Name,Email,Subject,Message\n", 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle POST request to save messages to Excel (CSV)
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { name, email, subject, message } = JSON.parse(body);
        
        if (!name || !email || !subject || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'All fields are required' }));
          return;
        }

        // Escape CSV fields
        const escapeCSV = (field) => {
          let str = String(field || '');
          if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const now = new Date();
        const timestamp = now.toISOString();
        const formattedDate = now.toLocaleString();
        
        const row = `${escapeCSV(timestamp)},${escapeCSV(formattedDate)},${escapeCSV(name)},${escapeCSV(email)},${escapeCSV(subject)},${escapeCSV(message)}\n`;

        fs.appendFileSync(CSV_PATH, row, 'utf8');
        console.log(`Saved submission from ${name} to inbox.csv`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Message saved to Excel!' }));
      } catch (err) {
        console.error("Error writing to CSV:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to write data' }));
      }
    });
    return;
  }

  // Handle static file serving (GET)
  if (req.method === 'GET') {
    let urlPath = req.url.split('?')[0]; // Strip query parameters
    let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
    
    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File Not Found');
        } else {
          res.writeHead(500);
          res.end('Internal Server Error: ' + err.code);
        }
      } else {
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
    return;
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`Portfolio server is running at http://localhost:${PORT}`);
  console.log(`Submissions will be saved to Excel file: ${CSV_PATH}`);
});
