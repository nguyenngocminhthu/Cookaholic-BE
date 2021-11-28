const db = require('../models')
const RecipeSaved = db.recipeSaved

exports.save = (req, res) => {
    const recipe = req.params.recipe
    const user = req.params.user

    if (req.params.status == 1) {
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
    const recipe = req.params.recipe
    const user = req.params.user

    RecipeSaved.findOne({ user: user, recipe: recipe })
        .then(data => {
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


exports.getByUser = (req, res)=>{
    const user = req.params.user

    RecipeSaved.findOne({ user: user })
    .populate("recipe")
    .exec(async(err, data)=>{
        if (err) {
            res.status(500).json({ message: err, success: false });
            return
        }

        if (!data) {
            // return res.status(404).send({ message: "User not found." })
            return res.status(400).json({ message: "Not found.", success: false });
        }

        res.status(200).json({
            id: data._id,
            user: data.user,
            recipe: data.recipe,
            success: true,
        });
    })

}

exports.delete = (req, res) => {
    const id = req.params.id

    RecipeSaved.deleteOne({ _id: id })
        .exec((err, data) => {
            if (err) {
                res.status(500).json({ message: err, success: false})
                return
            }

            res.status(200).json({message: "Delete success!", success: true})
        })
}