const controllerrecipe = require('../controllers/recipe.controller')
const controlleruser = require('../controllers/user.controller')

module.exports = (app) => {
    app.get("/api/searchrecipe", controllerrecipe.search)
    app.get("/api/searchuser", controlleruser.search)

}