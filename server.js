const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors");
const dotenv= require("dotenv")
const logger = require("morgan")
const passport = require("passport")
const session = require("express-session")
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

const jwt = require("jsonwebtoken")
const config = require("./app/config/auth.config")

const app = express();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}),cors())

dotenv.config()

var corsOptions = {
    origin: ["http://localhost:3000", "https://cooking-tutorial.herokuapp.com/"]
};

app.use(cors(corsOptions));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'))




const db = require('./app/models');
// const { role } = require('./app/models');
// const Role = db.role
// const { user } = require('./app/models');
// const User = db.user
const { user: User, role: Role, refreshToken: RefreshToken } = db;


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


app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, done) {
    done(null, user);
});


passport.deserializeUser(function (user, done) {
    // User.findById(id, function(err, user) {
    //   done(err, user);
    // });
    done(null, user);

});

passport.use(new GoogleStrategy({
    clientID: '741877373176-savm5ic6j7s14804jet71sqhbmc8a4il.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:8888/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {

        User.findOne({ googleId: profile.id }
            // $or:
            //     [
            //         { email: profile.emails[0].value },
            //         { googleId: profile.id }
            //     ]
            , function (err, user) {
                if (!user) {
                    console.log(0)
                    user = new User({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id
                    })
                    user.save((err, user) => {
                        if (err) {
                            res.status(500).json({ message: err, success: false })
                            return
                        }

                        // Tim 1 document trong collection roles co name : "user"
                        Role.findOne({ name: "user" }, (err, role) => {
                            if (err) {
                                res.status(500).json({ message: err, success: false })
                                return
                            }

                            user.roles = [role._id]
                            user.save()
                        })

                    })
                }

                return done(err, user);
            });
    }
))

// passport.use(new FacebookStrategy({
//     clientID: '876160799940732',
//     clientSecret: '6bfe896ef5d542067a81c17a903f43ea',
//     callbackURL: "https://5c66-2405-4803-c78a-35a0-913e-a7c6-c6b0-e037.ngrok.io/auth/facebook/callback"
// },
//     function (accessToken, refreshToken, profile, done) {

//         console.log(profile)
//         User.findOne({ googleId: profile.id }
//             // $or:
//             //     [
//             //         { email: profile.emails[0].value },
//             //         { googleId: profile.id }
//             //     ]
//             , function (err, user) {
//                 if (!user) {
//                     console.log(0)
//                     user = new User({
//                         username: profile.displayName,
//                         email: profile.emails[0].value,
//                         googleId: profile.id
//                     })
//                     user.save((err, user) => {
//                         if (err) {
//                             res.status(500).send({ message: err })
//                             return
//                         }

//                         // Tim 1 document trong collection roles co name : "user"
//                         Role.findOne({ name: "user" }, (err, role) => {
//                             if (err) {
//                                 res.status(500).send({ message: err })
//                                 return
//                             }

//                             user.roles = [role._id]
//                             user.save()
//                         })

//                     })
//                 }

//                 return done(err, user);
//             });
//     }
// ))

app.get("/", (req, res) => {
    res.json({ message: "hello " })
})
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/topic.routes')(app);
require('./app/routes/recipe.routes')(app);
require('./app/routes/comment.routes')(app);
require('./app/routes/recipeSaved.routes')(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        const user = req.user
        User.findOne({
            googleId: user.googleId
        })
            // Ket voi du lieu ben collection roles
            .populate("roles", "-__v")
            .exec(async (err, user) => {
                if (err) {
                    res.status(500).json({ message: err, success: false });
                    return
                }

                // Tao ma token
                var token = jwt.sign({ id: user._id }, config.secret, {
                    // expiresIn: 86400
                    expiresIn: config.jwtExpiration
                });

                let refreshToken = await RefreshToken.createToken(user);

                // var authorities = []
                let authorities = []

                for (let i = 0; i < user.roles.length; i++) {
                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
                }

                res.status(200).json({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                    refreshToken: refreshToken,
                    success: true,
                });
            });
    });
// app.get('/auth/facebook',
//     passport.authenticate('facebook', { scope: ['profile']} ));

// app.get('/auth/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/login' }),
//     function (req, res) {
//         // Successful authentication, redirect home.
//         const user = req.user
//         User.findOne({
//             googleId: user.googleId
//         })
//             // Ket voi du lieu ben collection roles
//             .populate("roles", "-__v")
//             .exec(async (err, user) => {
//                 if (err) {
//                     res.status(500).send({ message: err })
//                     return
//                 }

//                 // Tao ma token
//                 var token = jwt.sign({ id: user._id }, config.secret, {
//                     // expiresIn: 86400
//                     expiresIn: config.jwtExpiration
//                 });

//                 let refreshToken = await RefreshToken.createToken(user);

//                 // var authorities = []
//                 let authorities = []

//                 for (let i = 0; i < user.roles.length; i++) {
//                     authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
//                 }

//                 res.status(200).send({
//                     id: user._id,
//                     username: user.username,
//                     email: user.email,
//                     roles: authorities,
//                     accessToken: token,
//                     refreshToken: refreshToken
//                 });
//             });
//     });

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