let timeSeriesDataStore;

class TimeSeriesDataStore {
  constructor() {
    this.reset();
  }

  static getDataStore() {
    if (!timeSeriesDataStore) {
      timeSeriesDataStore = new TimeSeriesDataStore();
    }

    return timeSeriesDataStore;
  }

  async reset() {
    this.db = {};
    this.add = jest.fn();
    this.add
      .mockReturnValue(new Promise(resolve => resolve()));
  }

  async set(event, reference, x, interval, value) {
    this.db[`${event}_${reference}_${x}_${interval}`] = value;
  }

  async count(event, reference, x, interval) {
    return this.db[`${event}_${reference}_${x}_${interval}`];
  }
}

module.exports = TimeSeriesDataStore;
