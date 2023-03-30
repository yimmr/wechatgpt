process.on('uncaughtException', (err) => {
  console.error(`Caught exception:\n`, err);
});

process.env.PORT ||= 80;
process.env.HOST ||= 'localhost';

import httpServer from './src/fastify/index.js';

httpServer();
