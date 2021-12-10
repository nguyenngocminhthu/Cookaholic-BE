const mongoose = require('mongoose')

const Recipe = mongoose.model(
    "Recipe",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic"
        },
        image: String,
        name: String,
        title:String,
        time:String,
        serving:String,
        ingre: [],
        directions: [],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],
        rate: Number,
        status: Number,
        createAt: String
    })
)

module.exports = Recipe