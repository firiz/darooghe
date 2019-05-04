const Moment = require('moment');
const mongodb = require('../util/mongodb');

let timeSeriesDataStore;

class TimeSeriesDataStore {
  constructor() {
    this.synced = false;
    this.collections = [];
    this.db = mongodb.db;
  }

  static getDataStore() {
    if (!timeSeriesDataStore) {
      timeSeriesDataStore = new TimeSeriesDataStore();
    }

    return timeSeriesDataStore;
  }

  async _syncCollections() {
    const collectionObjects = await this.db.collections();
    this.collections = collectionObjects.map(c => c.collectionName);
    this.synced = true;
  }

  async _getCollection(name) {
    if (!this.synced) {
      await this._syncCollections();
    }

    const collectionName = `ts_${name}`;

    if (!this.collections.includes(collectionName)) {
      await this.db.createCollection(collectionName);
      const collection = this.db.collection(collectionName);
      await collection.createIndex({
        timeBucket: 1,
        reference: 1,
        type: 1,
      });
      await collection.createIndex({
        timeBucket: 1,
        reference: 1,
      });
      await collection.createIndex({
        reference: 1,
      });
    }

    return this.db.collection(collectionName);
  }

  _getFormats() {
    return {
      'minute': 'YYYY-MM-DD-HH-mm',
      'hour': 'YYYY-MM-DD-HH',
      'day': 'YYYY-MM-DD',
      'week': 'YYYY-WW',
    };
  }

  _getTimeBucket(timestamp) {
    const moment = Moment(timestamp);
    const formats = this._getFormats();
    const formatKeys = Object.keys(formats);

    const timeBucket = [];

    for (const formatKey of formatKeys) {
      timeBucket.push(`${moment.format(formats[formatKey])}-${formatKey}`);
    }

    return timeBucket;
  }

  async add(event, type, reference, timestamp, tags) {
    const collection = await this._getCollection(event);
    await collection.insertOne({
      reference,
      type,
      timestamp,
      timeBucket: this._getTimeBucket(timestamp),
      tags,
    });
  }

  _getBuckets(x, interval) {
    const formats = this._getFormats();
    const moment = Moment();
    const buckets = [];
    for (let i = 0; i < x; i += 1) {
      moment.add(-1 * i, interval);
      buckets.push(`${moment.format(formats[interval])}-${interval}`);
    }
    return buckets;
  }

  async count(event, reference, x, interval) {
    const collection = await this._getCollection(event);
    let match;
    if (x !== undefined) {
      const buckets = this._getBuckets(x, interval);
      match = {
        reference,
        timeBucket: {
          $in: buckets,
        },
      };
    } else {
      match = {
        reference,
      };
    }

    const result = await collection.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: '$type',
          count: {'$sum': 1},
        },
      },
    ]).toArray();

    const count = result.reduce((value, item) => {
      value[item._id] = item.count;
      value.ALL += item.count;
      return value;
    }, { ALL: 0 });

    return count;
  }
}

module.exports = TimeSeriesDataStore;
