const db = require('../models')
const Recipe = db.recipe
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

exports.create = async (req, res) => {
    const data = req.body
    console.log(data)
    const recipe = new Recipe({
        user: data.user,
        topic: data.topic,
        image: data.image,
        name: data.name,
        title: data.title,
        time: data.time,
        serving: data.serving,
        ingre: data.ingre,
        directions: data.directions,
        rate: 0,
        status: 1.5
    })

    // recipe.ingre = [{ "_id": 1, "name": "aaa" }]
    // ingre=req.body.ingre
    // let a=[]
    // for(let i=0; i<ingre.length;i++){
    //     let b={"_id":i+1, "name":ingre[i]}
    //     a.push(b)
    // }
    // recipe.ingre=a
    // recipe.directions = [{ "_id": 1, "content": "good", "image": null }]
    recipe.save((err, data) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ data, success: true })
    })
}

// Get all recipe by Status
exports.findAll = async (req, res) => {
    const status = req.params.status
    console.log(status)
    Recipe.find({ status: status })
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found", success: false })
                return
            }
            else
                res.status(200).json({ data, success: true })
        })
        .catch(err => {
            res.status(500).json({ message: "Error ", success: false });
        })
}

// Get a recipe 
exports.findOne = async (req, res) => {

    Recipe.findById(req.body.id)
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

// Get recipe by topic 
exports.findByTopic = async (req, res) => {
    const query = req.query.id
    let id = [query];
    if (Array.isArray(query)) {
        id = query.map((item) => ObjectId(item))
    }
    Recipe.find({ topic: { "$in": id }, status: 0 })
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found ", success: false })
                return
            }
            else
                res.status(200).json({ data, success: true })

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ message: err, success: false })
            return
        })
}

// Get recipe with user and status
exports.findByUser = async (req, res) => {
    const id = req.params.id
    const status = req.params.status
    Recipe.find({ user: id, status: status })
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found ", success: false })
                return
            }
            else
                res.status(200).json({ data, success: true })

            // res.send(data)
        })
        .catch(err => {
            res.status(500).send({ message: "Error ", success: false });
            return
        })
}

//==============//

//Update
exports.update = async (req, res) => {
    const id = req.params.id
    const data = req.body
    Recipe.updateOne({ _id: id }, { $set: data }, (err) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Update success!", success: true })
    })

}

// Update Status (Admin)
exports.updateStatus = (req, res) => {
    const id = req.params.id
    Recipe.updateOne({ _id: id }, { $set: { status: 0 } }, (err) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Approved recipe!", success: true })
    })
}


//================//

//Delete a Recipe
exports.deleteOne = async (req, res) => {
    const id = req.params.id

    Recipe.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found recipe with id " + id })
                return
            }
            else
                res.send({ mesage: "Delete success!" })
        })
        .catch(err => {
            res.status(500).send({ message: "Error delete topic with id=" + id });
        })
}

