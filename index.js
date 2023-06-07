const http = require('http');
const https = require('https');
const cors = require('cors');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { protocol, hostname, pathname, search } = url;

  const options = {
    method: req.method,
    headers: req.headers,
  };

  const protocolHandler = protocol === 'https:' ? https : http;
  const proxyReq = protocolHandler.request(hostname, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.on('data', (chunk) => {
      res.write(chunk);
    });

    proxyRes.on('end', () => {
      res.end();
    });
  });

  proxyReq.on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });

  req.on('data', (chunk) => {
    proxyReq.write(chunk);
  });

  req.on('end', () => {
    proxyReq.end();
  });
});

server.use(cors());

server.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});