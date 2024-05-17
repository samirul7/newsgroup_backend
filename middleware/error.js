const winston = require('winston')

module.exports = function (err, req, res, next) {
  winston.error(err, { metadata: err.stack })
  res.status(500).send('Somthing went wrong... yes from error --updated')
}
