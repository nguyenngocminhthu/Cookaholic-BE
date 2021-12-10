const mongoose = require('mongoose')

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        firstName: String,
        lastName: String,
        email: String,
        phone: Number,
        description: String,
        password: String,
        googleId: String,
        facebookId: String,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ],
        gender: String,
        avt: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        
        
    })
)

module.exports = User