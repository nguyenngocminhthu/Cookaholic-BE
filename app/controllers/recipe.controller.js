const db = require('../models')
const Recipe = db.recipe
const User = db.user
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const format = require('date-fns/format')

exports.create = async (req, res) => {
    const data = req.body
    console.log(data)

    let date = new Date()
    date.setHours(date.getHours() + 7)
    date = format(date, "hh:mm dd/MM/yy")

    const ingredients = data.ingre
    const ingre = ingredients.split("\n")

    const direc = data.directions
    const directions = direc.split("\n")

    const recipe = new Recipe({
        user: data.user,
        topic: data.topic,
        image: data.image,
        name: data.name,
        title: data.title,
        time: data.time,
        serving: data.serving,
        ingre: ingre,
        directions: directions,
        rate: 0,
        status: 1.5,
        createAt: date
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

        res.status(200).json({ data, message: "Add recipe success!", success: true })
    })
}

// Get all recipe by Status
exports.findAll = async (req, res) => {
    const status = req.query.status;
    Recipe.find({ status: status })
        .populate("user")
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
    const id = req.params.id
    Recipe.findById(id)
        .populate("user")
        .populate("topic")
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found ", success: false })
                return
            }

            // var re1 = new RegExp("[Cơá]");
            // console.log(re1)
            // console.log("test: " + re1.test("Cơm ngon quá"));

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
    const status = req.query.status
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
                res.status(404).json({ message: "Not found recipe", success: false })
                return
            }

            res.json({ mesage: "Delete success!", success: true })
        })
        .catch(err => {
            res.status(500).json({ message: "Error delete topic", success: false });
        })
}


//================//

//Search
exports.search = (req, res) => {
    let search = req.body.search
    // search = '['+search+']'
    search = new RegExp(search, "i")
    console.log(1)
    console.log(search)

    Recipe.find()
        .then(recipe => {
            if (!recipe) {
                res.status(404).json({ message: "Not found recipe", success: false })
                return
            }

            // var re1 = new RegExp("[Cơá]");
            //     console.log("test: " + search.test("Cơm ngon quá"));

            // data.reduce((prev, next) => console.log(prev))
            // res.json({ mesage: "Delete success!", success: true })

            //         const randoms = [4,6,78,2,34,8,90,34,23,23,5,6,234,435];
            // let odds = randoms.filter(number => number % 2 != 0);
            // console.log(odds);

            // let data = recipe.filter(x=>{
            //     console.log(x.username)  
            //     search.test(x.username)
            // })
            // console.log(data)

            let data = []
            recipe.forEach(x => {
                console.log(x.name)

                if (search.test(x.name)) {
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
