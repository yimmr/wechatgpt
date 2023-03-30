const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOST = 'localhost',
  MONGO_PORT = '27017',
} = process.env;

const mongoURL = `mongodb://${
  MONGO_USERNAME ? `${MONGO_USERNAME}:${MONGO_PASSWORD}@` : ''
}${MONGO_HOST}:${MONGO_PORT}`;

const instances = new Map();

const dataManager = {
  mongoURL,

  get mongo() {
    return instances.get('mongo');
  },

  /**
   * @param {FastifyMongoObject} mongoObject
   */
  setMongo(mongoObject) {
    instances.set('mongo', mongoObject);
  },
};

export default dataManager;
