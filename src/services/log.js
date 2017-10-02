// @flow
var winston = require('winston');

winston.add(require('winston-daily-rotate-file'), {
  filename: 'logs/puppetron.log',
  datePattern: '.yy-MM-dd'
});

module.exports = winston;