// exports.allAccess = (req, res) => {
//     res.status(200).json("Public Content.")
// }

// exports.userBoard = (req, res) => {
//     res.status(200).json("User Content.")
// }

// exports.adminBoard = (req, res) => {
//     res.status(200).json("Admin Content.");
// };

const db = require('../models')
const User = db.user
const Role = db.role
const format = require('date-fns/format')
const bcrypt = require("bcrypt");
const { user } = require('../models');

exports.getAllUser = (req, res) => {
    User.find()
        .populate("roles", "-__v")
        .exec((err, data) => {
            if (err) {
                console.log(err)
                res.status(500).json({ message: err, success: false })
                return
            }

            if (!data) {
                res.status(400).json({ message: "Not found user", success: false })
                return
            }

            console.log(data[1].roles[0].name)
            for (let i = 0; i < data.length; i++) {
                if (data[i].roles[0].name == "admin")
                    data.splice(i, 1)
            }

            res.status(200).json({ data, success: true })
        })

}

exports.getUser = async (req, res) => {
    const id = req.params.id
    User.findById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found ", success: false })
                return
            }
            else
                res.status(200).json({ data, success: true })
        })
        .catch(err => {
            res.status(500).json({ message: err, success: false })
            return
        })

}

exports.update = (req, res) => {
    const id = req.params.id
    const data = req.body
    User.updateOne({ _id: id }, { $set: data }, (err) => {
        if (err) {
            console.log(err)
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Update success!", success: true })
    })
}

exports.changePassword = (req, res) => {
    const id = req.params.id
    const oldPass = req.body.oldPass
    const newPass = req.body.newPass

    User.findById(id)
        .then((async (user) => {
            const passwordIsValid = await bcrypt.compare(
                oldPass,
                user.password
            )

            if (!passwordIsValid) {
                res.status(401).json({ message: "Current password not true!", success: false })
                return
            }

            user.updateOne({ $set: { password: bcrypt.hashSync(newPass, 8) } }, (err) => {
                if (err) {
                    res.status(500).json({ message: err, success: false })
                    console.log(err)
                    return
                }

                res.status(200).json({ message: "Update success!", success: true })
            })
        }))
        .catch(err => {
            res.status(500).json({ message: err, success: false })
            console.log(err)
        })

}

exports.createAdmin = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        gender: req.body.gender,
        isVerified: true
    })

    user.save((err, user) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }
        console.log(user)
        Role.findOne({ name: "admin" }, (err, role) => {
            if (err) {
                res.status(500).json({ message: err, success: false })
                return
            }
            user.roles = [role._id]
            user.save(err => {
                if (err) {
                    res.status(500).json({ message: err, success: false })
                    return
                }

                res.json({ message: "Add admin successfully!", success: true })
            })
        })
    })
}

exports.delete = (req, res) => {
    const id = req.params.id

    User.deleteOne({ _id: id }, (err) => {
        if (err) {
            console.log(err)
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Delete success!", success: true })
    })
}

//=============//

// Search by username
exports.search = (req, res) => {
    let search = req.body.search
    // search = '['+search+']'
    search = new RegExp(search, "i")
    console.log(1)
    console.log(search)

    User.find()
        .then(user => {
            if (!user) {
                res.status(404).json({ message: "Not found User", success: false })
                return
            }

            let data = []
            user.forEach(x => {
                console.log(x.username)

                if (search.test(x.username)) {
                    data.push(x)
                }
            })

            console.log(data)

            res.json({ data, success: true })

        })
        .catch(err => {
            res.status(err.status).json({ message: err, success: false });
            console.log(err)
        })
}
