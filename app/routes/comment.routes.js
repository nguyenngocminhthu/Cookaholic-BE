const controller = require('../controllers/comment.controller')
const { cloudinary } = require("../middlewares")

module.exports = (app) => {
    app.post("/api/comment", cloudinary.single('image'), controller.create)
    app.get("/api/comment/:recipe", controller.getByRecipe)
}