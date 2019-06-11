// @flow
import type { OptionsType } from '../types/options'
const { URL } = require('url')
const { DEBUG } = process.env
const getBrowser = require('../services/browser')
const pdf = require('../formats/pdf')
const image = require('../formats/image')
const log = require('../services/log')

/* eslint-disable security/detect-non-literal-regexp */

var asyncEach = async (arr, fn) => {
  for (const item of arr) await fn(item)
}

const defaultOptions = {
  width: 1024,
  height: 768,
  type: 'jpeg'
}

module.exports = (app: any) => {
  let browser

  var completeScreenshot = async (options, page, res) => {
    log.info('💥 Get Output: ' + options.type)
    if (options.type === 'pdf') {
      await pdf(options, page, res)
    } else if (options.type === 'png' || options.type === 'jpeg') {
      await image(options, page, res)
    }
    log.info('🗑 Disposing ' + options.url)
    page.removeAllListeners()
    try {
      log.info('🗑 Clearing Cookies')
      const cookies = await page.cookies()
      log.info(JSON.stringify(cookies))
      if (cookies && Array.isArray(cookies) && cookies.length > 0) {
        await asyncEach(cookies, async (cookie) => {
          await page.deleteCookie(cookie)
        })
      }
    } catch (err) {
      log.error('Error clearing cookies')
      log.error(err)
    }
    log.info('🗑 Closing Page ' + options.url)
    return page.close()
  }

  var completeRequest = async (req, res, options) => {
    if (options && options.url) {
      options = Object.assign(defaultOptions, options)

      let page, pageURL
      try {
        if (!/^https?:\/\//i.test(options.url)) {
          throw new Error('Invalid URL')
        }
        const { origin, pathname, hash } = new URL(options.url)
        const path = decodeURIComponent(pathname)

        pageURL = origin + path + hash
        const width = parseInt(options.width, 10)
        const height = parseInt(options.height, 10)

        if (!browser) {
          browser = await getBrowser()
        }
        const page = await browser.newPage()

        if (options.cookies) {
          await asyncEach(options.cookies, async (cookie) => {
            await page.setCookie(cookie)
          })
        }
        if (options.headers) {
          await page.setExtraHTTPHeaders(options.headers)
        }

        if (options.agent) {
          await page.setUserAgent(options.agent)
        }

        if (options.lang) {
          await page.setExtraHTTPHeaders({
            'Accept-Language': options.lang
          })
        }

        if (options.emulateMedia) {
          await page.emulateMedia(options.emulateMedia)
        }

        await page.setViewport({
          width,
          height,
          deviceScaleFactor: options.deviceScaleFactor || 1
        })

        log.info('⬇️ Fetching ' + pageURL)
        if (options.selector) {
          try {
            await page.goto(pageURL, {
              timeout: 60000,
              waitUntil: 'domcontentloaded'
            })
            log.info('⏲ Waiting for selector: ' + options.selector)
            await page.waitForSelector(options.selector, options.selectorOptions)
            await completeScreenshot(options, page, res)
          } catch (err) {
            log.error(`Failed waiting for selector with error: ${err.message}`)
          }
        } else {
          await page.goto(pageURL, {
            timeout: 60000,
            waitUntil: 'networkidle0'
          })
          await completeScreenshot(options, page, res)
        }
      } catch (err) {
        log.error(err)
        if (!DEBUG && page) {
          log.info('💔 Force close ' + pageURL)
          page.removeAllListeners()
          page.close()
        }

        const { message = '' } = err
        res.status(400).send('Oops. Something is wrong.\n\n' + message)

        // Handle websocket not opened error
        if (/not opened/i.test(message) && browser) {
          log.error('🕸 Web socket failed')
          try {
            browser.close()
            browser = null
          } catch (err) {
            log.warn(`Chrome could not be killed ${err.message}`)
            browser = null
          }
        }
      }
    } else {
      res.status(400).send({ error: 'Missing required options' })
    }
  }

  app.get('/', async (req, res) => {
    var options: OptionsType = req.query
    completeRequest(req, res, options)
  })

  app.post('/', async (req, res) => {
    var options: OptionsType = req.body
    completeRequest(req, res, options)
  })

  process.on('SIGINT', () => {
    if (browser) browser.close()
    process.exit()
  })

  process.on('unhandledRejection', (reason, p) => {
    log.error('Unhandled Rejection at:', p, 'reason:', reason)
    if (browser) browser.close()
    process.exit()
  })
}
