const config = require("../config/auth.config")
const db = require("../models")
// const User = db.user
// const Role = db.role
const { user: User, role: Role, refreshToken: RefreshToken, token: Token } = db;

// var jwt = require("jsonwebtoken")
// var bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Kiem tra, them roles va luu user vao db
exports.signup = (req, res) => {

    // Tao user tu request gui len
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        sex: req.body.sex,
    })

    user.save((err, user) => {
        if (err) {
            res.status(500).json({ message: err, success: false })
            return
        }

        // Kiem tra co roles trong request khong
        if (req.body.roles) {
            // Tim tat ca role trong request co trong collection roles
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).json({ message: err, success: false })
                        return
                    }

                    user.roles = roles.map(role => role._id)
                    user.save(err => {
                        if (err) {
                            res.status(500).json({ message: err, success: false })
                            return
                        }

                        res.json({ message: "User was registered successfully!", success: true })
                    })

                }
            )
        } else {

            // Tim 1 document trong collection roles co name : "user"
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).json({ message: err, success: false })
                    return
                }
                user.roles = [role._id]
                user.save(err => {
                    if (err) {
                        res.status(500).json({ message: err, success: false })
                        return
                    }

                    res.json({ message: "User was registered successfully!", success: true })
                })
            })
        }
    })
}

// Kiem tra dang nhap neu thanh cong tra ve user va accestoken
exports.signin = (req, res) => {
    // Tim user co username giong username vua nhap 
    User.findOne({
        // username: req.body.username
        email: req.body.username
    })
        // Ket voi du lieu ben collection roles
        .populate("roles", "-__v")
        .exec(async (err, user) => {
            if (err) {
                res.status(500).json({ message: err, success: false });
                return
            }

            // Kiem tra co user trung khong
            if (!user) {
                // return res.status(404).send({ message: "User not found." })
                return res.status(404).json({ message: "Email not found.", success: false });
            }

            // So password nhap va password db
            // var passwordIsValid = bcrypt.comparseSync(
            //     req.body.password,
            //     user.password
            // )
            const passwordIsValid = await bcrypt.compare(
                req.body.password,
                user.password
            )

            // Kiem tra password co hop le khong
            if (!passwordIsValid) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Invalid Password",
                    success: false
                })
            }

            // Tao ma token
            var token = jwt.sign({ id: user.id }, config.secret, {
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
};

exports.refreshToken = async (req, res) => {
    const { refreshToken: requestToken } = req.body;

    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required!", success: false });
    }

    try {
        let refreshToken = await RefreshToken.findOne({ token: requestToken });

        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token is not in database!", success: false });
            return;
        }

        if (RefreshToken.verifyExpiration(refreshToken)) {
            RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

            res.status(404).json({
                message: "Refresh token was expired. Please make a new signin request",
                success: false,
            });
            return;
        }

        let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
            expiresIn: config.jwtExpiration
        });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token,
            success: true,
        });
    } catch (err) {
        return res.status(500).json({ message: err, success: false });
    }
}

exports.sendLink = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        console.log(process.env.HOST)
        if (!user || user.googleId!=null) {
            res.status(400).send("User with given email doesn't exist")
            return
        }

        let token = await Token.findOne({ userId: user._id })
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save()
        }

        const link = `http://localhost:8888/api/auth/${user._id}/${token.token}`
        await sendEmail(user.email, "Password reset", link)

        res.json({message:"password reset link sent to your email account", success: true})

    } catch (err) {
        res.send("An error occured")
        console.log(err)
    }
}

exports.resetPassword = async (req, res) => {
    try{
        const user = await User.findById(req.params.userId);
        if (!user){
            res.status(400).json({message:"invalid link or expired",success: false}) 
            return
        } 

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token){
            res.status(400).json({message:"invalid link or expired",success: false}) 
            return
        } 

        user.password = bcrypt.hashSync(req.body.password, 8)
        // user.password=req.body.password
        
        await user.save();
        await token.delete();

        res.json({message:"password reset sucessfully.", success: true});
    } catch (error) {
        res.json({message:"An error occured", success: false});
        console.log(error);
    }
}