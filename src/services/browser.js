// @flow
const puppeteer = require('puppeteer')
const log = require('./log')
const Config = require('../config')

module.exports = async () => {
  log.info('🚀 Launch browser!')
  const config = {
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl',
      '--lang=en-GB'
    ],
    dumpio: false,
    headless: true
  }
  if (Config.DEBUG) config.dumpio = true
  if (Config.HEADFUL) {
    log.info('🤖🤖🤖 HEADFUL 🤖🤖🤖')
    config.headless = false
    config.args.push('--auto-open-devtools-for-tabs')
  }
  if (Config.CHROME_BIN && Config.CHROME_BIN !== 'undefined') {
    log.info(`🤖🤖🤖 Using Local Chrome ${Config.CHROME_BIN} 🤖🤖🤖`)
    config.executablePath = Config.CHROME_BIN
  }
  return puppeteer.launch(config)
}
