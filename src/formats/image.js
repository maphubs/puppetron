//@flow
const jimp = require('jimp');
const pTimeout = require('p-timeout');
import type {OptionsType} from '../types/options';

module.exports = async function(options: OptionsType, page: any, res: any){
  const thumbWidth = parseInt(options.thumbWidth, 10) || null;
  const fullPage = options.fullPage;
  const clipSelector = options.clipSelector;
  const width = options.width;

  let clip;
  if (clipSelector){
    // SOON: https://github.com/GoogleChrome/puppeteer/pull/445
    const handle = await page.$(clipSelector);
    if (handle){
      clip = await page.evaluate((el) => {
        const {x, y, width, height} = el.getBoundingClientRect();
        return Promise.resolve({x, y, width, height});
      }, handle);
      const bottom = clip.y + clip.height;
      if (page.viewport().height < bottom){
        await page.setViewport({
          width,
          height: bottom,
        });
      }
    }
  }

  const screenshot = await pTimeout(page.screenshot({
    type: options.type,
    fullPage,
    clip,
  }), 60 * 1000, 'Screenshot timed out');

  res.writeHead(200, {
    'content-type': `image/${options.type}`,
  });
  

  if (thumbWidth && thumbWidth < width){
    let mimeType = jimp.MIME_JPEG;
    if(options.type === 'png'){
      mimeType = jimp.MIME_PNG;
    }

    const image = await jimp.read(screenshot);
    image.resize(thumbWidth, jimp.AUTO).quality(options.quality).getBuffer(mimeType, (err, buffer) => {
      res.end(buffer, 'binary');
    });
  } else {
    res.end(screenshot, 'binary');
  }
};