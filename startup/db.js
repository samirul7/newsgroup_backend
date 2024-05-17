const mongoose = require('mongoose')
const winston = require('winston')

// mongodb://localhost/newsgroup

module.exports = function () {
  mongoose
    .connect(process.env.MONGODB)
    .then(() => winston.info('Connected to MongoDB'))
}
