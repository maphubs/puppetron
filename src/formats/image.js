// @flow
import type { OptionsType } from '../types/options'
const pTimeout = require('p-timeout')
const savetoS3 = require('../services/s3')
const log = require('../services/log')

module.exports = async (options: OptionsType, page: any, res: any) => {
  const fullPage = options.fullPage

  const screenshot = await pTimeout(page.screenshot({
    type: options.type,
    fullPage
  }), 60 * 1000, 'Screenshot timed out')

  if (options.s3) {
    try {
      const info = await savetoS3(options.type, options.s3, screenshot)
      res.status(200).send(info)
    } catch (err) {
      log.error(err)
      res.status(500).send(err.message)
    }
  } else {
    res.writeHead(200, {
      'content-type': `image/${options.type}`
    })
    res.end(screenshot, 'binary')
  }
}
