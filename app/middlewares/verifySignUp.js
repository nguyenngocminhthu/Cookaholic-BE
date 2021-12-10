const db = require('../models')
const ROLES = db.ROLES
const User = db.user

checkDuplicateEmail = (req, res, next) => {
    //Username
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (err) {
            res.status(500).json({ message: err, success: false });
            return;
        }

        if (user) {
            res.status(400).json({ message: "Failed! Email is already in use!", success: false });
            return
        }

        next()
    })
    // })
}

checkDuplicatePhone = (req, res, next) => {
    //Username
    User.findOne({ phone: req.body.phone }).exec((err, user) => {
        if (err) {
            res.status(500).json({ message: err, success: false });
            return;
        }

        if (user) {
            res.status(400).json({ message: "Failed! Phone is already in use!", success: false });
            return
        }

        next()
    })
    // })
}

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).json({
                    message: `Failed! Role ${req.body.roles[i]} does not exist`,
                    success: false,
                })
                return
            }
        }
    }
    next()
}

const verifySignUp = {
    checkDuplicateEmail,
    checkRolesExisted,
    checkDuplicatePhone
}

module.exports = verifySignUp