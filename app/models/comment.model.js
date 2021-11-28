const mongoose = require('mongoose')

const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        recipe:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        },
        rate: Number,
        content: String,
        image:String
    },
        { timestamps: true }
    )
)

module.exports = Comment