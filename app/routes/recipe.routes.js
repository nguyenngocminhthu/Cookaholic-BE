const controller = require('../controllers/recipe.controller')
const { cloudinary } = require("../middlewares")
const { authJwt } = require("../middlewares")

module.exports = (app) => {
    app.post("/api/recipe", controller.create)
    app.get("/api/recipe/topic", controller.findByTopic)
    app.get("/api/recipe", controller.findAll)
    app.get("/api/recipe/:id", controller.findOne)
    app.get("/api/recipe/user/:id", controller.findByUser)
    app.put("/api/recipe/:id", controller.update)
    app.delete("/api/recipe/:id", controller.deleteOne)
    app.put("/api/recipe/status/:id", controller.updateStatus)
}