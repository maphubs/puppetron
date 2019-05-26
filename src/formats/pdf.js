// @flow
import type { OptionsType } from '../types/options'
const pTimeout = require('p-timeout')

// for options see https://pptr.dev/#?product=Puppeteer&version=v1.5.0&show=api-pagepdfoptions

module.exports = async (options: OptionsType, page: any, res: any) => {
  const defaultOptions = {
    printBackground: true
  }
  const combinedOptions = Object.assign(defaultOptions, options)

  // don't allow the PDF to be written to local disk
  if (combinedOptions.path) {
    delete combinedOptions.path
  }

  const pdf = await pTimeout(page.pdf(combinedOptions), 30 * 1000, 'PDF timed out')

  res.writeHead(200, {
    'Content-Type': 'application/pdf'
  })
  res.end(pdf, 'binary')
}
