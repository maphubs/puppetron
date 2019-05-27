// @flow

const express = require('express')
const consign = require('consign')
const logger = require('morgan')
const cors = require('cors')
const shrinkRay = require('shrink-ray-current')
const bodyParser = require('body-parser')
const Raven = require('raven')
const log = require('./services/log')
const config = require('./config')
const version = require('../package.json').version
var http = require('http')

const app = express()
app.enable('trust proxy')
app.disable('x-powered-by')

log.info(`Environment: "${app.get('env').toString()}"`)

const ravenConfig = (process.env.NODE_ENV === 'production') && config.SENTRY_DSN
Raven.config(ravenConfig, {
  release: version,
  environment: config.ENV_TAG,
  tags: { host: config.HOST },
  parseUser: ['id', 'display_name', 'email']
}).install()

app.use(Raven.requestHandler())

// use compression
app.use(shrinkRay())

// CORS
app.use(cors())
app.options('*', cors())

app.use(logger('dev', {
  skip (req) {
    // don't log every healthcheck ping
    if (req.path === '/healthcheck') {
      return true
    }
    return false
  }
}))

app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({
  limit: '1mb',
  extended: false
}))

app.use((err, req, res, next) => {
  if (err) {
    log.error(err.message)
  }
  next()
})

consign().include('./src/routes').into(app)

app.use(Raven.errorHandler())

app.use((req, res) => {
  res.status(404)
  res.send({
    title: '404: Page not found',
    error: '404: Page not found',
    url: req.url
  })
})

app.use((err, req, res) => {
  var statusCode = err.status || 500
  var statusText = ''
  var errorDetail = (process.env.NODE_ENV === 'production') ? 'Looks like we have a problem. A message was automatically sent to our team.' : err.stack

  switch (statusCode) {
    case 400:
      statusText = 'Bad Request'
      break
    case 401:
      statusText = 'Unauthorized'
      break
    case 403:
      statusText = 'Forbidden'
      break
    case 500:
      statusText = 'Internal Server Error'
      break
  }

  log.error(err.stack)

  if (req.accepts('json')) {
    res.status(statusCode).send({
      title: statusCode + ': ' + statusText,
      error: errorDetail,
      url: req.url
    })
  }
})

var server = http.createServer(app)
server.listen(config.INTERNAL_PORT, () => {
  log.info('**** STARTING SERVER ****')
  log.info('Server Running on port: ' + config.INTERNAL_PORT)
})
