const mongoose = require('mongoose')

const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        rate: Number,
        content: String,
        avt: String,
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            content: String,
            createAt:String
        }],
        createAt: String
    })
)

module.exports = Comment