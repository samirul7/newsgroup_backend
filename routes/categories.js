const express = require('express')
const winston = require('winston')

const router = express.Router()
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const { Category } = require('../models/category')
const { User } = require('../models/user')
const normalUser = require('../middleware/normalUser')

// for all category
router.get('/', [auth], async (req, res) => {
  try {
    const categories = await Category.find()
    if (!categories) return res.status(400).send('No Categories found')
    res.send(categories)
  } catch (ex) {
    winston.error(ex)
    res.status(500).send('Server Error.')
  }
})

// for user category
router.get('/user', [auth], async (req, res) => {
  try {
    const categories = await User.findById(req.user._id)
      .select('subscribedCategory')
      .populate('subscribedCategory')
    if (!categories) return res.status(400).send('No Categories found')
    res.send(categories)
  } catch (ex) {
    winston.error(ex)
    res.status(500).send('Server Error.')
  }
})

router.post('/add', [auth, normalUser], async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { subscribedCategory: req.body.categoryId },
    })
    res.send('Successfully Subscribed!')
  } catch (ex) {
    winston.error(ex)
    res.status(500).send('Server Error.')
  }
})
router.post('/remove', [auth, normalUser], async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { subscribedCategory: req.body.categoryId },
    })
    res.send('Successfully Unsubscribed!')
  } catch (ex) {
    winston.error(ex)
    res.status(500).send('Server Error.')
  }
})

module.exports = router
