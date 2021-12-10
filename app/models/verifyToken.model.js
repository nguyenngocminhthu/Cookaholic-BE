const mongoose = require('mongoose')

const VerifyToken= mongoose.model(
    "VerifyToken",
    new mongoose.Schema({
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        token:String,
        createAt:{
            type: Date,
            expires: 1200,
            default: Date.now
        }
    })  
)

module.exports= VerifyToken