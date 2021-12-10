// const { authJwt } = require("../middlewares")
// const controller = require("../controllers/user.controller")

// module.exports = function (app) {
//     app.use(function (req, res, next) {
//         res.header(
//             "Access-Control-Allow-Headers",
//             "x-access-token, Origin, Content-Type, Accept"
//         );
//         next();
//     })

//     app.get("/api/test/all", controller.allAccess);

//     app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

//     app.get(
//         "/api/test/admin",
//         [authJwt.verifyToken, authJwt.isAdmin],
//         controller.adminBoard
//     );
// }

const controller = require("../controllers/user.controller")
const { authJwt, verifySignUp} = require("../middlewares")

module.exports = (app) => {
    app.get("/api/user", [authJwt.verifyToken], controller.getAllUser)
    app.get("/api/user/:id", controller.getUser)
    app.put("/api/user/:id", [verifySignUp.checkDuplicatePhone], controller.update)
    app.delete("/api/user/:id", [authJwt.verifyToken], controller.delete)
    app.put("/api/user/changePassword/:id", [authJwt.verifyToken], controller.changePassword)
    app.post("/api/admin", [authJwt.verifyToken], controller.createAdmin)
    // app.get("/api/getauth", controller.handleGetAuth)
}