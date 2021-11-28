const db = require('../models')
const Topic = db.topic

exports.create = async (req, res) => {
    let path = null
    if (req.file)
        path = req.file.path

    const data = req.body
    const topic = new Topic({
        name: data.name,
        image: path,
    })
    topic.save((err, data) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ data, success: true })
    })
    try {
        await topic.save()
    } catch (error) {
        return res.status(400).json({
            message: error,
            success: false
        })
    }
}

exports.findAll = async (req, res) => {

    Topic.find()
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found", success: false })
                return
            }
            else
                // res.send(data)
                res.status(200).json({ data, success: true })
        })
        .catch(err => {
            res.status(500).json({ message: err, success: false });
        })
}
