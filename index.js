const path = require('path');
const Darooghe = require('./domain/Darooghe');
const mongodb = require('./util/mongodb');

const jobsDirectory = path.join(__dirname, '/jobs');

const run = async () => {
  try {
    await mongodb.connect();
    const darooghe = new Darooghe(jobsDirectory);
    await darooghe.run();
  } catch (error) {
    console.log(error);
    setTimeout(() => { process.exit(1); }, 3000);
  }
};

run();
