const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize Game Servers Logic (ported from backend)
// We need to adjust imports inside ws/index.js if they import from backend root
// But first, let's create the server and pass io to it.
const initializeGameServers = require('./ws/index');

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
  });

  // Initialize Game Servers
  try {
      // Mock logger if needed, or implement simple logger
      // Check ws/index.js dependence on logger
      initializeGameServers(io);
      console.log('> Game Servers Initialized');
  } catch (err) {
      console.error('Failed to initialize game servers:', err);
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
