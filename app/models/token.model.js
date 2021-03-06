const mongoose = require('mongoose')

const Token= mongoose.model(
    "Token",
    new mongoose.Schema({
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        token:String,
        createAt:{
            type: Date,
            expires: 300,
            default: Date.now
        }
    })  
)

module.exports= Token