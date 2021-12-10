const controller = require('../controllers/comment.controller')

module.exports = (app) => {
    app.post("/api/comment", controller.create)
    app.get("/api/comment/:recipe", controller.getByRecipe)
    app.post("/api/comment/reply", controller.reply)
    app.delete("/api/comment", controller.delete)
    app.delete("/api/comment/reply", controller.deleteReply)
}