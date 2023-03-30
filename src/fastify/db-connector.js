import fastifyMongodb from '@fastify/mongodb';
import mongoose from 'mongoose';

import dataManager from '../data/data-manager.js';

/**
 * @param {FastifyInstance} fastify
 */
async function dbConnector(fastify) {
  const { mongoURL: url } = dataManager;
  const { DBNAME } = process.env;

  fastify.register(fastifyMongodb, {
    url,
    database: DBNAME,
    forceClose: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  fastify.ready((err) => {
    if (err) throw err;

    dataManager.setMongo(fastify.mongo);

    mongoose.connect(url, {
      dbName: DBNAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    fastify.log.info('MongoDB connected');
  });
}

export default dbConnector;
