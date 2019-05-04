const { MongoClient } = require('mongodb');
const config = require('../config');

let mongodb = {};

mongodb.connect = async () => {
  try {
    const url =
      `mongodb://${
        config.get('mongodb.host')
      }:${
        config.get('mongodb.port')
      }/${
        config.get('mongodb.database')
      }`;

    const client = await MongoClient.connect(url, {
      poolSize: config.get('mongodb.poolSize'),
      appname: 'darooghe',
      useNewUrlParser: true,
    });

    mongodb.db = client.db(config.get('mongodb.database'));
  } catch (error) {
    console.error('Unable to connect to MongoDB', error);
    process.exit(-1);
  }
};

module.exports = mongodb;
