const dbConfig = require('../config/db.config')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}
db.mongoose = mongoose
db.url = dbConfig.url

db.user = require('./user.model')
db.role = require('./role.model')
db.refreshToken = require('./refreshToken')
db.topic=require('./topic.model')

db.recipe = require('./recipe.model')
db.comment = require('./comment.model')
db.recipeSaved=require('./recipeSaved.model')
db.token=require('./token.model')
db.verifyToken=require('./verifyToken.model')

db.ROLES = ["user", "admin"]

module.exports = db