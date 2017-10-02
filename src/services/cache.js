//@flow
const LRU = require('lru-cache');
const log = require('./log');

module.exports = {
  cache: undefined,
  initCache(){
    this.cache = LRU({
      max: process.env.CACHE_SIZE || Infinity,
      maxAge: 1000 * 60, // 1 minute
      noDisposeOnSet: true,
      dispose: async (url, page) => {
        try {
          if (page && page.close){
            log.info('🗑 Disposing ' + url);
            page.removeAllListeners();
            await page.deleteCookie(await page.cookies());
            await page.close();
          }
        } catch (err){
          log.error(err);
        }
      }
    });
    setInterval(() => this.cache.prune(), 1000 * 60); // Prune every minute
  },
  getCache(){
    if(!this.cache){
      this.initCache();
    }
    return this.cache;
  }
};