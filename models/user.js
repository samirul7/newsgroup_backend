const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 5,
    maxLength: 255,
    trim: true,
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    required: true,
  },
  isAdmin: Boolean,
  subscribedCategory: [
    {
      ref: 'category',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  readArticles: [
    {
      ref: 'articles',
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
})

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      isAdmin: this.isAdmin || false,
    },
    config.get('jwtPrivateKey')
  )
}

const User = mongoose.model('users', userSchema)

function validate(user) {
  const userSchema = Joi.object({
    name: Joi.string().min(5).max(50).required().trim(),
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

  return userSchema.validate(user)
}

module.exports.User = User
module.exports.validate = validate
