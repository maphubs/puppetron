//@flow
const cache = require('../services/cache').getCache();;

module.exports = function(app: any) {

  app.get('/status', (req, res) => {
    res.status(200).send({
     pages: cache.keys(),
      process: {
        versions: process.versions,
        memoryUsage: process.memoryUsage(),
      }
    });
  });

  app.get('/healthcheck', (req, res) => {
    res.status(200).send();
  });

  app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
  });

};