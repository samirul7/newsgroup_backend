const winston = require('winston')
const express = require('express')

const app = express()

require('./startup/logging')()
require('./startup/config')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/validation')()

// PORT
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  winston.info(`Server is listening on port ${PORT}`)
})
