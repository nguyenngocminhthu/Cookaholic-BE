const mongoose = require('mongoose')

const Token= mongoose.model(
    "Token",
    new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        token:String,
        createAt:{
            type: Date,
            default: Date.now,
            expires: 3600,
        }
    })
)

module.exports= Token