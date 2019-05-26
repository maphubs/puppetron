// @flow

module.exports = (app: any) => {
  app.get('/status', (req, res) => {
    res.status(200).send({
      process: {
        versions: process.versions,
        memoryUsage: process.memoryUsage()
      }
    })
  })

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK!')
  })

  app.get('/favicon.ico', (req, res) => {
    res.status(204).send()
  })
}
