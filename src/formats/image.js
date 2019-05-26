// @flow
import type { OptionsType } from '../types/options'
const jimp = require('jimp')
const pTimeout = require('p-timeout')

module.exports = async (options: OptionsType, page: any, res: any) => {
  const thumbWidth = parseInt(options.thumbWidth, 10) || null
  const fullPage = options.fullPage
  const width = options.width

  const screenshot = await pTimeout(page.screenshot({
    type: options.type,
    fullPage
  }), 60 * 1000, 'Screenshot timed out')

  res.writeHead(200, {
    'content-type': `image/${options.type}`
  })

  if (thumbWidth && thumbWidth < width) {
    let mimeType = jimp.MIME_JPEG
    if (options.type === 'png') {
      mimeType = jimp.MIME_PNG
    }

    const image = await jimp.read(screenshot)
    image.resize(thumbWidth, jimp.AUTO).quality(options.quality).getBuffer(mimeType, (err, buffer) => {
      res.end(buffer, 'binary')
    })
  } else {
    res.end(screenshot, 'binary')
  }
}
