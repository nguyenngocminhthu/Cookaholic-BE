const controller = require('../controllers/topic.controller')
const { cloudinary } = require("../middlewares")

module.exports = (app) => {
    // app.use((req, res, next) => {
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "x-access-token, Origin, Content-Type, Accept"
    //     );
    //     next();
    // })

    app.post("/api/topic", cloudinary.single('image'), controller.create)
    app.get("/api/topic", controller.findAll)
}