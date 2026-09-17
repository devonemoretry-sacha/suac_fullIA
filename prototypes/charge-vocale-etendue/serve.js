// PROTOTYPE - NOT FOR PRODUCTION — serveur statique du prototype « Charge vocale étendue ».
// Raison d'être : getUserMedia exige un contexte sécurisé ET un document de
// premier niveau. http://localhost remplit les deux ; une iframe d'artefact non.
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 4322;
const ROOT = __dirname;
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.wav':'audio/wav' };

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Charge vocale étendue — http://localhost:${PORT}`));
