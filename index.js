const mongodb = require('./util/mongodb');

const run = async () => {
  try {
    await mongodb.connect();
  } catch (error) {
    console.log(error);
    setTimeout(() => { process.exit(1); }, 3000);
  }
};

run();
