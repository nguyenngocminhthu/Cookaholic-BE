const db = require('../models')
const Topic = db.topic

exports.create = async (req, res) => {
    const data = req.body
    const topic = new Topic({
        name: data.name,
        image: data.image,
    })
    topic.save((err, data) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ data, success: true })
    })

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

exports.delete=async(req,res)=>{
    const id=req.query.id

    Topic.deleteOne({_id:id},(err) => {
        if (err) {
            console.log(err)
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Delete success!", success: true })
    })
}