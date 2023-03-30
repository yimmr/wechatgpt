import dataManager from './data-manager.js';
import MongoDB from './mongodb.js';

async function db(group, dbName = '') {
  const mongoDB = new MongoDB(dataManager.mongo, dbName || process.env.DBNAME, group);

  return mongoDB;
}

export default db;
