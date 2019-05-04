const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const Promise = require('bluebird');
fetch.Promise = Promise;
const TimeSeriesDataStore = require('../data-store/TimeSeriesDataStore');

class Darooghe {
  constructor(jobsDirectory) {
    this.dataStore = TimeSeriesDataStore.getDataStore();
    const files = fs.readdirSync(jobsDirectory);
    this.jobs = files
      .map(f => require(path.join(jobsDirectory, f)))
      .filter(j => j.enabled);
    this.fetchOptions = {
      timeout: 4000,
    };
  }

  async run() {
    for (const job of this.jobs) {
      let result;
      let time;
      // Result
      const start = Date.now();
      if ('GET' === job.endpoint.method) {
        result = await fetch(job.endpoint.url, this.fetchOptions);
      }
      if ('POST' === job.endpoint.method) {
        result = await fetch(job.endpoint.url, {
          ...this.fetchOptions,
          method: 'post',
          body:    JSON.stringify(job.endpoint.body),
          headers: { 'Content-Type': 'application/json' },
        });
      }
      time = Date.now() - start;

      // Up/Down
      let status;
      if (job.result.httpStatus) {
        status = result.status === job.result.httpStatus? 'UP' : 'DOWN';
      }

      await this.dataStore.add(job.name, status, 'default', Date.now(), {
        time,
      });
      console.log(`${job.name}: ${status} in ${time}ms`);
    }

    await Darooghe._wait(5000);
    return this.run();
  }

  static async _wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    })
  }
}

module.exports = Darooghe;
