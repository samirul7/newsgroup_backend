const mongoose = require('mongoose')

const Article = mongoose.model(
  'articles',
  new mongoose.Schema({
    title: {
      type: String,
      minLength: 3,
      maxLength: 40,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    description: {
      type: String,
      minLength: 5,
    },
    imgUrl: {
      type: String,
      required: true,
    },
  })
)

exports.Article = Article
