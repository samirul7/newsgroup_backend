const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
})

const Category = mongoose.model('category', schema)

exports.Category = Category
