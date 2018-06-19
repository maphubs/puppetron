//@flow
const {URL} = require('url');
const {DEBUG} = process.env;
// const http = require('http');
//const cache = require('../services/cache').getCache();
const getBrowser = require('../services/browser');
const pdf = require('../formats/pdf');
const image = require('../formats/image');
const log = require('../services/log');

// const TIMEOUT = log.SCREENSHOT_TIMEOUT ? log.SCREENSHOT_TIMEOUT : 60;
// const MAX_REQUESTS = log.SCREENSHOT_MAX_REQUESTS ? log.SCREENSHOT_MAX_REQUESTS : 10000;

// const blocked = require('../blocked.json');
/*eslint-disable security/detect-non-literal-regexp */
// const blockedRegExp = new RegExp('(' + blocked.join('|') + ')', 'i');

// const truncate = (str, len) => str.length > len ? str.slice(0, len) + '…' : str;

var asyncEach = async function(arr, fn) {
  for(const item of arr) await fn(item);
};

import type {OptionsType} from '../types/options';

const defaultOptions = {
  width: 1024,
  height: 768,
  type: 'jpeg'
};

module.exports = function(app: any) {

    let browser;

    var completeScreenshot = async function(options, page, res){
      log.info('💥 Get Output: ' + options.type);
      if(options.type === 'pdf'){
        await pdf(options, page, res);
      }else if(options.type === 'png' || options.type === 'jpeg'){
        await image(options, page, res);
      }
      log.info('🗑 Disposing ' + options.url);
      page.removeAllListeners();
      try{
        const cookies = await page.cookies();
        log.info(cookies);
        if(cookies && Array.isArray(cookies) && cookies.length > 0){
          await asyncEach(cookies, async (cookie)=>{
            await page.deleteCookie(cookie);
          });
        }
      }
      catch(err){
        log.error(err);
      }
      await page.close();
    };

    var completeRequest = async function(req, res, options){
      if(options && options.url){
        options = Object.assign(defaultOptions, options);

        let page, pageURL;
        try{
          if (!/^https?:\/\//i.test(options.url)) {
            throw new Error('Invalid URL');
          }
          const {origin, pathname} = new URL(options.url);
          const path = decodeURIComponent(pathname);
          //const {host} = req.headers;


          pageURL = origin + path;
          const width = parseInt(options.width);
          const height =  parseInt(options.height);

          if (!browser) {
            browser = await getBrowser();
          }
          const page = await browser.newPage();

            if(options.cookies){
              await asyncEach(options.cookies, async (cookie)=>{
                await page.setCookie(cookie);
              });
            }
            if(options.headers){
              await page.setExtraHTTPHeaders(options.headers);
            }

            if(options.agent){
              await page.setUserAgent(options.agent);
            }

            if(options.lang){
              await page.setExtraHTTPHeaders({
                'Accept-Language': options.lang
              });
            }
      
            if(options.emulateMedia){
              await page.emulateMedia(options.emulateMedia);
            }
            //const nowTime = +new Date();
            //let reqCount = 0;
            //await page.setRequestInterceptionEnabled(true);
            /*
            page.on('request', (request) => {
              const {url, method, resourceType} = request;
      
              
              // Skip data URIs
              if (/^data:/i.test(url)){
                request.continue();
                return;
              }
              
      
              const seconds = (+new Date() - nowTime) / 1000;
              const shortURL = truncate(url, 70);
              const otherResources = /^(manifest|other)$/i.test(resourceType);
              // Abort requests that exceeds 15 seconds
              // Also abort if more than 100 requests
              if (seconds > TIMEOUT || reqCount > MAX_REQUESTS){
                log.info(`❌⏳ ${method} ${shortURL}`);
                request.abort();
              } else if (blockedRegExp.test(url) || otherResources){
                //log.info(`❌ ${method} ${shortURL}`);
                //request.abort();
                log.info(`✅ ${method} ${shortURL}`);
                request.continue();
              } else {
                log.info(`✅ ${method} ${shortURL}`);
                request.continue();
                reqCount++;
              }
            });
            */
            /*
            let responseReject;
            const responsePromise = new Promise((resolve, reject) => {
              responseReject = reject;
            });
            page.on('response', ({headers}) => {
              const location = headers['location'];
              if (location && location.includes(host)){
                responseReject(new Error('Possible infinite redirects detected.'));
              }
            });
            */
      
            await page.setViewport({
              width,
              height
            });
      
            log.info('⬇️ Fetching ' + pageURL);

            if(options.selector){
              page.waitForSelector(options.selector, options.selectorOptions)
              .then(()=>{
                return completeScreenshot(options, page, res);
              }).catch((err)=>{
                log.error(`Failed waiting for selector with error: ${err.message}`);
                return completeScreenshot(options, page, res);
              });
            }
        
            await page.goto(pageURL, {
              timeout: 60000,
              waitUntil: 'networkidle0'
            });
      
            // Pause all media and stop buffering
            /*
            page.frames().forEach((frame) => {
              frame.evaluate(() => {
                //*eslint-disable no-undef
                document.querySelectorAll('video, audio').forEach(m => {
                  if (!m) return;
                  if (m.pause) m.pause();
                  m.preload = 'none';
                });
                //eslint-enable
              });
             
            });
             */
         
          if(!options.selector){
            completeScreenshot(options, page, res);
          }

        } catch (err) {
          log.error(err);
          if (!DEBUG && page) {
            log.info('💔 Force close ' + pageURL);
            page.removeAllListeners();
            page.close();
          }
          
          const {message = ''} = err;
          res.status(400).send('Oops. Something is wrong.\n\n' + message);
      
          // Handle websocket not opened error
          if (/not opened/i.test(message) && browser){
            log.error('🕸 Web socket failed');
            try {
              browser.close();
              browser = null;
            } catch (err) {
              log.warn(`Chrome could not be killed ${err.message}`);
              browser = null;
            }
          }
        }
      }else{
        res.status(400).send({error: 'Missing required options'});
      }
    };

    app.get('/', async (req, res) => {
      var options: OptionsType = req.query;
      completeRequest(req, res, options);
    });

    app.post('/', async (req, res) => {
      var options: OptionsType = req.body;
      completeRequest(req, res, options);
    });

    process.on('SIGINT', () => {
      if (browser) browser.close();
      process.exit();
    });

    process.on('unhandledRejection', (reason, p) => {
     log.error('Unhandled Rejection at:', p, 'reason:', reason);
      if (browser) browser.close();
      process.exit();
    });
  
  
  };