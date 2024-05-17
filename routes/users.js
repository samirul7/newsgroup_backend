const _ = require('lodash')
const express = require('express')
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')

const { User, validate } = require('../models/user')

const router = express.Router()

// GET

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.send(user)
})

// POST
// signup
router.post('/', async (req, res) => {
  const { error, value } = validate(
    _.pick(req.body, ['name', 'email', 'password'])
  )
  if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findOne({ email: value.email })
  if (user) return res.status(400).send('User is already exists.')

  //   process the password
  const salt = await bcrypt.genSalt(10)
  const password = await bcrypt.hash(value.password, salt)
  value.password = password

  user = new User(value)
  try {
    user = await user.save()
    const token = user.generateAuthToken()
    res
      .header('x-auth-token', token)
      .send(_.pick(user, ['name', 'email', '_id']))
  } catch (error) {
    console.log(
      'Something went wrong while creating user in the database',
      error
    )
    res
      .status(500)
      .send('Something went wrong while creating user in the database')
  }
})

module.exports = router
