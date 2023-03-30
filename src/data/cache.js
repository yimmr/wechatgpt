import dataManager from './data-manager.js';
import MongoCache from './mongo-cache.js';

async function cache(group, dbName = '') {
  const cache = new MongoCache(dataManager.mongo, dbName || process.env.DBNAME, group);

  await cache.connect();

  return cache;
}

export const adminCache = async () => await cache('admin-cache');

export const wechatMessageCache = async () => await cache('wechat-message-cache');

export default cache;
