const jwt = require("jsonwebtoken")
const config = require("../config/auth.config")
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        console.log(err.expiredAt);
        return res.status(401).json({ message: "Unauthorized! Access Token was expired!", success: false })
    }

    return res.sendStatus(401).json({ message: "Unauthorized!", success: false })
}

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"]

    if (!token) {
        return res.status(403).json({ message: "No token provided!", success: false })
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        console.log("1_" + err);
        if (err) {
            // return res.status(401).send({ message: "Unauthorized!" })
            return catchError(err, res)
        }
        req.userId = decoded.id;
        console.log(decoded);
        console.log(req.userId);

        next()
    })
}

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                console.log(user.roles)
                if (err) {
                    res.status(500).json({ message: err, success: false })
                    return
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next()
                        return
                    }
                }

                res.status(403).json({ message: "Require Admin Role!", success: false })
                return
            }
        )
    })
}

const authJwt = {
    verifyToken,
    isAdmin
}

module.exports = authJwt