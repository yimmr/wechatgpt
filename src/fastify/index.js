import fastify from 'fastify';
import dbConnector from './db-connector.js';
import routes from './rutes.js';

/**
 * @param {FastifyHttpOptions} fastifyOptions
 */
export default function httpServer(fastifyOptions = {}) {
  const { LOG_DISABLED = true, LOG_LEVEL = 'error', LOG_FILE_PATH } = process.env;
  const app = fastify({
    logger: LOG_DISABLED ? { level: LOG_LEVEL, file: LOG_FILE_PATH } : false,
    ...fastifyOptions,
  });

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.code(500).send({ error: 'Something went wrong' });
  });

  dbConnector(app);

  app.register(routes);

  app.listen({ port: process.env.PORT, host: process.env.HOST });
}
