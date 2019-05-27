// @flow
const AWS = require('aws-sdk')
const uuidv4 = require('uuid/v4')
const config = require('../config')
const log = require('./log')

module.exports = async (type: string, path: string, data: any) => {
  const uuid = uuidv4()
  const s3 = new AWS.S3()

  let contentType
  if (type === 'pdf') {
    contentType = 'application/pdf'
  } else {
    contentType = `image/${type}`
  }

  return new Promise((resolve, reject) => {
    const key = `screenshots/${path}/${uuid}.${type}`
    s3.putObject({
      Bucket: config.S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType
    },
    (error, data) => {
      if (error) reject(error)
      log.info(`saved to s3: ${key}`)
      resolve({
        id: uuid,
        url: `${config.CDN_URL}/${key}`
      })
    }
    )
  })
}
