const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors");
const dotenv = require("dotenv")
const logger = require("morgan")

const app = express();

dotenv.config()

var corsOptions = {
    origin: ["http://localhost:3000", "https://cooking-tutorial.herokuapp.com/"]
};
app.use(cors(corsOptions));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'))

const db = require('./app/models');
const Role = db.role;


db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected DB");
        initial()
    })
    .catch(err => {
        console.error("Connection error", err)
        process.exit()
    })

app.get("/", (req, res) => {
    res.json({ message: "hello " })
})
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/topic.routes')(app);
require('./app/routes/recipe.routes')(app);
require('./app/routes/comment.routes')(app);
require('./app/routes/recipeSaved.routes')(app);
require('./app/routes/search.routes')(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err)
                }
                console.log("added 'user' to roles collection")
            })

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err)
                }
                console.log("added 'admin' to roles collection")
            })
        }
    })
}