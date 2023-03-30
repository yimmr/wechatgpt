class MongoCache {
  /**
   * @param {FastifyMongoObject} mongo
   * @param {string} dbName
   * @param {string} collectionName
   */
  constructor(mongo, dbName, collectionName) {
    this.mongo = mongo;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.collection = null;
  }

  async connect() {
    if (!this.collection) {
      const db = this.mongo.client.db(this.dbName);
      this.collection = db.collection(this.collectionName);
      // 创建索引用于过期自动删除
      await this.collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
    }
  }

  async set(key, value, ttl) {
    const expireAt = new Date(Date.now() + ttl * 1000);
    await this.collection.updateOne({ _id: key }, { $set: { value, expireAt } }, { upsert: true });
  }

  async get(key) {
    const doc = await this.collection.findOne({ _id: key });
    return doc ? doc.value : null;
  }

  async delete(key) {
    await this.collection.deleteOne({ _id: key });
  }

  /**
   * @param {string} key
   * @param {number} timeout 加锁的超时时间的秒数
   * @returns {boolean}
   */
  async lock(key, timeout) {
    const start = Date.now();
    while (true) {
      const doc = await this.collection.findOne({ _id: key });
      if (!doc) {
        await this.collection.insertOne({ _id: key, lockedAt: new Date() });
        return true;
      }
      if (!doc.lockedAt || Date.now() - doc.lockedAt.getTime() > timeout * 1000) {
        await this.collection.updateOne({ _id: key }, { $set: { lockedAt: new Date() } });
        return true;
      }
      if (Date.now() - start >= timeout * 1000) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async unlock(key) {
    await this.collection.updateOne({ _id: key }, { $unset: { lockedAt: '' } });
  }
}

export default MongoCache;
