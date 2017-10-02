//@flow
const pTimeout = require('p-timeout');
import type {OptionsType} from '../types/options';

module.exports = async function(options: OptionsType, page: any, res: any){

  const pdf = await pTimeout(page.pdf(options), 30 * 1000, 'PDF timed out');

  res.writeHead(200, {
    'Content-Type': 'application/pdf'
  });
  res.end(pdf, 'binary');
};