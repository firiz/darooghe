const convict = require('convict');

const config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  mongodb: {
    host: {
      doc: "Database host name/IP",
      default: 'localhost'
    },
    port: {
      doc: "Database port",
      default: 27017
    },
    database: {
      doc: "Database name",
      default: 'darooghe'
    },
    poolSize: {
      doc: "Database connection pool size",
      default: 3
    },
  }
});

const env = config.get('env');
config.loadFile(`./config/${env}.json`);
config.validate({
  allowed: 'strict'
});

module.exports = config;
