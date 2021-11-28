const mongoose = require('mongoose')

const Topic = mongoose.model(
    "Topic",
    new mongoose.Schema({
        name: String,
        image: String,
    })
)

module.exports = Topic