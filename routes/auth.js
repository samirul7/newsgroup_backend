const express = require('express')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')
const _ = require('lodash')
const { User } = require('../models/user')
const bcrypt = require('bcrypt')

const router = express.Router()

router.post('/', async (req, res) => {
  const { error, value } = validate(_.pick(req.body, ['email', 'password']))
  if (error) return res.status(400).send(error.details[0].message)

  const user = await User.findOne({ email: value.email })
  if (!user) return res.status(401).send('Email or password is not valid')

  const isValidPassword = await bcrypt.compare(value.password, user.password)
  if (!isValidPassword)
    return res.status(400).send('Email or password is not valid')

  const token = user.generateAuthToken()
  res.send(token)
})

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required().trim(),
    password: passwordComplexity({
      min: 8,
      max: 26,
      lowerCase: 1,
      upperCase: 1,
      symbol: 1,
      numeric: 1,
    }),
  })

  return schema.validate(req)
}

module.exports = router
