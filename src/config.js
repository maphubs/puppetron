require('dotenv').config()
var getenv = require('getenv')
getenv.disableErrors()

module.exports = {
  INTERNAL_PORT: getenv('INTERNAL_PORT', 3000),
  SENTRY_DSN: getenv('SENTRY_DSN'),
  ENV_TAG: getenv('ENV_TAG'),
  HOST: getenv('HOST'),
  DEBUG: getenv.bool('DEBUG', false),
  HEADFUL: getenv.bool('HEADFUL', false),
  CHROME_BIN: getenv('CHROME_BIN'),
  CDN_URL: getenv('CDN_URL'),
  S3_BUCKET: getenv('S3_BUCKET')
}
