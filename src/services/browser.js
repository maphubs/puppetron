// @flow
const puppeteer = require('puppeteer')
const log = require('./log')
const local = require('../local')

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
  if (local.DEBUG) config.dumpio = true
  if (local.HEADFUL) {
    log.info('🤖🤖🤖 HEADFUL 🤖🤖🤖')
    config.headless = false
    config.args.push('--auto-open-devtools-for-tabs')
  }
  if (local.CHROME_BIN && local.CHROME_BIN !== 'undefined') {
    log.info(`🤖🤖🤖 Using Local Chrome ${local.CHROME_BIN} 🤖🤖🤖`)
    config.executablePath = local.CHROME_BIN
  }
  return puppeteer.launch(config)
}
