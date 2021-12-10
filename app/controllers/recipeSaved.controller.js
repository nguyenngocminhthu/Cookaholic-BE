const db = require('../models')
const RecipeSaved = db.recipeSaved

exports.save = (req, res) => {
    const recipe = req.params.recipe
    const user = req.params.user

    if (req.query.status == 1) {
        RecipeSaved.deleteOne({ user: user, recipe: recipe }, (err) => {
            if (err) {
                res.status(500).json({ message: err, success: false })
                return
            }

            res.status(200).json({ message: "Unsave!", success: true })
        })
        return
    }

    const recipeSaved = new RecipeSaved({
        user: user,
        recipe: recipe
    })

    recipeSaved.save((err, data) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        res.status(200).json({ message: "Saved success", success: true })
    })
}

exports.show = (req, res) => {

    const user = req.params.user
    const recipe = req.params.recipe
    console.log("user recipe: ", user, recipe);

    RecipeSaved.findOne({ user: user, recipe: recipe })
        .then(data => {
            console.log("data: ", data);
            if (!data) {
                res.json({ message: 0, success: true })
                return
            }
            res.json({ message: 1, success: true })

        })
        .catch(err => {
            res.status(500).json({ message: err, success: false })
        })
}


// exports.getByUser = (req, res) => {
//     const user = req.params.user

//     RecipeSaved.findOne({ user: user })
//         .then(data => {
//             if (!data) {
//                 res.status(400).json({ message: "No data is saved!", success: false })
//             }

//             res.status(200).json({ data, success: true })
//         })
//         .catch(err => {
//             res.status(500).json({ message: err, success: false })
//         })
// }


exports.getByUser = (req, res) => {
    const user = req.params.user

    RecipeSaved.find({ user: user })
        .populate("recipe")
        .populate("user")
        .exec(async (err, data) => {
            if (err) {
                res.status(500).json({ message: err, success: false });
                return
            }

            if (!data) {
                // return res.status(404).send({ message: "User not found." })
                return res.status(400).json({ message: "Not found.", success: false });
            }

            // res.status(200).json({
            //     id: data._id,
            //     user: data.user,
            //     recipe: data.recipe,
            //     success: true,
            // });

            res.status(200).json({ data, success: true })
        })

}

exports.delete = async (req, res) => {
    const id = req.params.id

    RecipeSaved.findByIdAndDelete(id)
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

exports.findOne = async (req, res) => {
    const id = req.query.id
    console.log(id)
    RecipeSaved.findById(id)
        .populate("user")
        .populate("recipe")
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found ", success: false })
                return
            }

            res.status(200).json({ data, success: true })
        })
        .catch(err => {
            res.status(500).json({ message: err, success: false })
            return
        })

}