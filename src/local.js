require('dotenv').config();
var getenv = require('getenv');
getenv.disableErrors();

var local = {
  INTERNAL_PORT: getenv('INTERNAL_PORT', 3000),
  SENTRY_DSN: getenv('SENTRY_DSN'),
  ENV_TAG: getenv('ENV_TAG'),
  HOST: getenv('HOST'),
  DEBUG: getenv.bool('DEBUG', false),
  HEADFUL: getenv.bool('HEADFUL', false),
  CHROME_BIN:  getenv('CHROME_BIN')
};

module.exports = local;