const controller = require('../controllers/recipe.controller')
const { cloudinary } = require("../middlewares")

module.exports = (app) => {
    app.post("/api/recipe", cloudinary.single('image'), controller.create)
    app.get("/api/recipe/topic", controller.findByTopic)
    app.get("/api/recipe/:status", controller.findAll)
    app.get("/api/recipe/:id", controller.findOne)
    app.get("/api/recipe/user/:id/:status", controller.findByUser)
    app.put("/api/recipe/:id", controller.update)
    app.get("/api/recipe/delete/:id", controller.deleteOne)
    app.put("/api/recipe/status/:id", controller.updateStatus)
}