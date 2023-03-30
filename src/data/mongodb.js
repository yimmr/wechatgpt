class MongoDB {
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
    if (this.client) return;

    try {
      this.client = await MongoClient.connect(this.url, { useUnifiedTopology: true });
      this.db = this.client.db(this.dbName);
      console.log(`Connected to ${this.url}`);
    } catch (err) {
      console.error(err);
    }
  }

  async insertOne(collectionName, document) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.insertOne(document);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async findOne(collectionName, query) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.findOne(query);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async findMany(collectionName, query) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.find(query).toArray();
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async updateOne(collectionName, filter, update) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.updateOne(filter, update);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteOne(collectionName, filter) {
    try {
      const collection = this.db.collection(collectionName);
      const result = await collection.deleteOne(filter);
      return result;
    } catch (err) {
      console.error(err);
    }
  }
}

export default MongoDB;
