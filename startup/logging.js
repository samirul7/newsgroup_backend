const winston = require('winston')
require('winston-mongodb')
require('express-async-errors')

module.exports = function () {
  // for unhandledExceptions
  winston.exceptions.handle(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint()
      ),
    }),
    new winston.transports.File({ filename: 'exceptions.log' })
  )

  //   for unhandledRejection
  process.on('unhandledRejection', (ex) => {
    throw ex
  })

  // LOG TO FILES
  winston.add(new winston.transports.File({ filename: 'logfile.log' }))

  // LOG TO DATABASE
  // winston.add(
  //   new winston.transports.MongoDB({
  //     db: 'mongodb://localhost/newsgroup',
  //     label: 'error',
  //   })
  // )

  process.on('unhandledRejection', (ex) => {
    throw ex
  })
}
