const express = require('express')
const winston = require('winston')

const { Article } = require('../models/article')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const { User } = require('../models/user')
const { Category } = require('../models/category')
const normalUser = require('../middleware/normalUser')

const router = express.Router()

// GET
router.get('/', [auth], async (req, res) => {
  // console.log(req.user._id)
  let userArticleIds = []
  const userId = req.user._id

  if (req.user.isAdmin)
    userArticleIds = (await Category.find().select('_id')).map(({ _id }) =>
      _id.toString()
    )
  else
    userArticleIds = (
      await User.findById(userId).select('subscribedCategory')
    ).subscribedCategory.map((id) => id.toString())

  // console.log(userArticleIds)
  // console.log(req.query.articles)
  // console.log(req.user.isAdmin)

  let commonCategories = []
  if (req.user.isAdmin && !req.query.articles) commonCategories = userArticleIds
  else
    commonCategories = req.query.articles.filter((id) =>
      userArticleIds.includes(id)
    )

  // console.log(commonCategories)

  if (commonCategories.length === 0)
    return res.status(400).send('Category must be provided.')

  const dbArticles = await Promise.all(
    commonCategories.map(async (category) => {
      const articles = await Article.find({
        category,
      }).populate('category')
      if (!articles.length) return null
      return articles
    })
  )
  let articles = [].concat(
    ...dbArticles.filter((articles) => articles !== null)
  )

  if (!req.user.isAdmin) {
    const readArticleIds = (
      await User.findById(userId).select('readArticles -_id')
    ).readArticles

    articles = articles.filter(
      (article) => !readArticleIds.includes(article._id)
    )
  }

  res.send(articles)
})

router.get('/read', [auth, normalUser], async (req, res) => {
  const userId = req.user._id

  const readArticleIds = (
    await User.findById(userId).select('readArticles -_id')
  ).readArticles //.map((id) => id.toString())

  let readArticles = await Promise.all(
    readArticleIds.map(async (id) => {
      const articles = await Article.findById(id).populate('category')
      return articles
    })
  )

  readArticles = [].concat(
    ...readArticles.filter((articles) => articles !== null)
  )

  res.send(readArticles)
})

router.get('/:id', [auth], async (req, res) => {
  try {
    const articleId = req.params.id
    const course = await Article.findById(req.params.id).populate('category')
    if (!course) return res.status(404).send('No article found.')

    const userId = req.user._id
    const userReadArticleIds = (
      await User.findById(userId).select('readArticles -_id')
    ).readArticles.map((articleId) => articleId.toString())
    const isRead = userReadArticleIds.includes(articleId)

    if (!req.user.isAdmin) {
      const userArticleIds = (
        await User.findById(req.user._id).select('subscribedCategory')
      ).subscribedCategory.map((id) => id.toString())

      if (!isRead && !userArticleIds.includes(course.category._id.toString()))
        return res.status(401).send('Forbidden')
    }

    // console.log(isRead)

    // console.log(course)

    // console.log({ ...course._doc, isRead })
    // console.log(course)
    res.send({ ...course, isRead })
  } catch (error) {
    winston.error('Something went wrong while fetching the article', error)
    res.status(500).send('Server Error.')
  }
})

// read an articles by a normal user
router.post('/:id/:type', [auth, normalUser], async (req, res) => {
  // readArticles
  try {
    const userId = req.user._id
    const type = req.params.type
    const articleId = req.params.id

    if (type === 'unread') {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          readArticles: articleId,
        },
      })
      return res.send({ message: 'Successfully, set mark as unread.' })
    }

    const userCategoryIds = (
      await User.findById(userId).select('-_id subscribedCategory')
    ).subscribedCategory.map((categoryId) => categoryId.toString())
    // console.log(userCategoryIds)
    // console.log(req.params.id)
    const articleCategoryId = (
      await Article.findById(req.params.id).select('category -_id')
    ).category.toString()

    if (!userCategoryIds.includes(articleCategoryId))
      return res
        .status(401)
        .send('You are not subscribed to this type of article.')

    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        readArticles: articleId,
      },
    })
    res.send({ message: 'Successfully, set mark as read.' })
  } catch (ex) {
    winston.error(ex.message)
    res.status(500).send('Server Error.')
  }
})

// POST
router.post('/', [auth, admin], async (req, res) => {
  const article = new Article(req.body)
  try {
    const result = await article.save()
    res.send({ message: 'Article created successfully', article: result })
  } catch (error) {
    winston.error('500 => ', error)
    res.status(500).send('Server Error!')
  }
})

// PUT

// DELETE
router.delete('/', [auth, admin], async (req, res) => {
  try {
    const article = await Article.findById(req.body._id)
    if (!article) return res.status(400).send('Invalid article id')

    await article.deleteOne()
    res.send(article)
  } catch (error) {
    winston.error(
      'Something went wrong while deleting a article from database...',
      error
    )
    res.status(500).send('Server Error')
  }
})

module.exports = router

// function validate(value){

// }
