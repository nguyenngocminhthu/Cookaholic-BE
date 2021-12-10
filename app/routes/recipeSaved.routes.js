const controller = require('../controllers/recipeSaved.controller')

module.exports = (app) => {
    // Get status cua recipe theo user
    app.get('/api/saved/:recipe/:user', controller.show)
    // Status == 1 ==> Luu Recipe 
    //Status == 0 ==> Xoa Recipe
    // Danh cho giao dien chi tiet Recipe
    app.post('/api/saved/:recipe/:user', controller.save)

    // Get tat ca Recipe cua 1 User (Trong profile)
    app.get('/api/saved/:user', controller.getByUser)

    // Xoa 1 Recipe duoc luu trong profile
    app.delete('/api/saved/:id', controller.delete)

}