const { comment } = require('../models')
const db = require('../models')
const { findOne } = require('../models/comment.model')
const Comment = db.comment
const Recipe = db.recipe
const format = require('date-fns/format')
const formatDistance = require('date-fns/formatDistance')

// Create cmt
exports.create = async (req, res) => {

    const data = req.body
    console.log(data)

    let rate = data.rate
    if (rate == '')
        rate = 0

    let date = new Date()
    date.setHours(date.getHours() + 7)
    date = format(date, "hh:mm dd/MM/yy")
    const comment = await Comment.create({
        user: data.user,
        recipe: data.recipe,
        rate: rate,
        content: data.content,
        createAt: date
    })

    console.log(comment)

    Recipe.findById(data.recipe)
        .then(result => {
            let rateOfRecipe = result.rate
            console.log(data.rate)

            let x = (rateOfRecipe / 2) + (data.rate / 2)

            console.log(rateOfRecipe / 2)
            console.log(data.rate / 2)
            console.log(x)
            comment.save((err, data) => {
                if (err) {
                    res.status(500).json({ message: err, success: false })
                    return
                }

                Recipe.findOneAndUpdate({ _id: data.recipe }, { $set: { rate: x } }, { new: true }, (err, doc) => {
                    if (err) {
                        res.status(500).json({ message: err, success: false })
                        return
                    }
                    console.log(doc)
                    res.status(200).json({ message: "Comment success!", success: true })
                })

            })
        })
        .catch(err => {
            res.status(500).json({ message: "Error ", success: false });
            console.log("err: ", err)
        })
}

exports.reply = (req, res) => {
    let date = new Date()
    date.setHours(date.getHours() + 7)
    date = format(date, "hh:mm dd/MM/yy")
    Comment.updateOne({ _id: req.body.id }, { $push: { replies: { user: req.body.user, content: req.body.content, createAt: date } } }, (err) => {
        if (err) {
            res.status(404).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Reply success!", success: true })
    })
}

exports.getByRecipe = async (req, res) => {
    const recipe = req.params.recipe
    Comment.find({ recipe: recipe })
        .populate("user")
        .populate("replies.user")
        .exec(async (err, data) => {
            if (err) {
                res.status(500).json({ message: err, success: false });
                return
            }

            if (!data) {
                // return res.status(404).send({ message: "User not found." })
                return res.status(404).json({ message: "Not found comment.", success: false });
            }

            let date = new Date()
            date.setHours(date.getHours() + 7)
            date = format(date, "hh:mm dd/MM/yy")
            console.log(date)

            // console.log(formatDistance(date, new Date(), { addSuffix: true }))

            let count = 0
            for (let i = 0; i < data.length; i++) {
                count += data[i].replies.length + 1;
            }

            console.log(count)

            res.status(200).json({ data, count: count, success: true });
        })
}

exports.delete = (req, res) => {
    const comment = req.query.comment
    console.log(comment)

    Comment.findOne({ _id: comment })
        .populate("recipe")
        .then(async (data) => {
            console.log(data)
            if (!data) {
                res.status(400).json({ message: "Not found this comment!", success: false })
                return
            }
            console.log(data)

            data.delete()
            res.status(200).json({ message: "Delete success!", success: true })
            return

        })
        .catch(err => {
            return res.status(err.status).json({ message: err, success: false })
        })

}

exports.deleteReply = (req, res) => {
    const comment = req.query.comment
    const reply = req.query.reply

    console.log(comment)

    Comment.findOne({ _id: comment })
        .populate("recipe")
        .then(async (data) => {
            console.log(data)
            if (!data) {
                res.status(400).json({ message: "Not found this comment!", success: false })
                return
            }
            console.log(data)

            const replies = data.replies
            for (let i = 0; i < replies.length; i++) {
                if (replies[i]._id == reply) {
                    data.replies.splice(i, 1)
                    data.save()
                    res.status(200).json({ message: "Delete success!", success: true })
                    return
                }
            }

        })
        .catch(err => {
            return res.status(err.status).json({ message: err, success: false })
        })
}