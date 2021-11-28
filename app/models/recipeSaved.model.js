const mongoose = require('mongoose')

const RecipeSaved = mongoose.model(
    "RecipeSaved",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe"
        }
    })
)

module.exports = RecipeSaved 