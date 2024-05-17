const express = require('express')
const { default: helmet } = require('helmet')
const cors = require('cors')

const Articles = require('../routes/articles')
const Categories = require('../routes/categories')
const Users = require('../routes/users')
const Auth = require('../routes/auth')
const error = require('../middleware/error')

module.exports = function (app) {
  // middlewares
  app.use(cors())
  app.use(helmet())
  app.use(express.json())

  // routes
  app.use('/api/articles', Articles)
  app.use('/api/users', Users)
  app.use('/api/auth', Auth)
  app.use('/api/categories', Categories)

  // error
  app.use(error)
}
