const config = require("../config/auth.config")
const db = require("../models")
const { user: User, role: Role, refreshToken: RefreshToken, token: Token, verifyToken: VerifyToken } = db;

const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { OAuth2Client } = require('google-auth-library');
const { response } = require("express");
const client = new OAuth2Client("741877373176-savm5ic6j7s14804jet71sqhbmc8a4il.apps.googleusercontent.com")
const fetch = require('node-fetch')

const { sendResetPassword, sendVerifyAccount } = require("../middlewares/sendEmail")

// Kiem tra, them roles va luu user vao db
exports.signup = (req, res) => {

    // Tao user tu request gui len
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        sex: req.body.sex,
        confirmationCode: crypto.randomBytes(32).toString("hex"),
        avt: "",
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
                    user.save(async (err, user) => {
                        if (err) {
                            res.status(500).json({ message: err, success: false })
                            return
                        }

                        res.json({ message: "User was registered successfully! Please check email!", success: true })


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
                user.save(async (err, user) => {
                    if (err) {
                        res.status(500).json({ message: err, success: false })
                        return
                    }

                    res.json({ message: "User was registered successfully! Please check email!", success: true })


                })
            })
        }
    })
}

exports.sendLink = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            res.status(400).json({ message: "User with given email doesn't exist", success: false })
            return
        }

        let token = await VerifyToken.findOne({ userId: user._id })

        token = await new VerifyToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save()



        const link = `http://localhost:3000/verify?user=${user._id}&token=${token.token}`
        await sendVerifyAccount(user.email, link)

        res.status(200).json({ message: "Verify link sent to your email", success: true })

    } catch (err) {
        res.status(err.status).json({ message: "An error occured", success: false })
        console.log(err)
    }
}

exports.verifyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.params.user);
        if (!user) {
            res.status(400).json({ message: "Invalid link or expired. Please login to verify account!", success: false })
            return
        }

        const token = await VerifyToken.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) {
            res.status(400).json({ message: "Invalid link or expired. Please login to verify account!", success: false })
            return
        }

        user.isVerified = true
        // user.password=req.body.password
        token.delete()
        await user.save();

        res.status(200).json({ message: "Your account is verified.", success: true });
    } catch (error) {
        res.status(500).json({ message: "An error occured", success: false });
        console.log(error);
    }
}

// Kiem tra dang nhap neu thanh cong tra ve user va accestoken
exports.signin = (req, res) => {
    // Tim user co username giong username vua nhap 
    User.findOne({
        // username: req.body.username
        email: req.body.email
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



            const haveToken = await Token.findOne({
                userId: user._id,
                // token: user.password
            });
            console.log(user.password)
            if (haveToken) {

                if (haveToken.token !== user.password) {
                    res.status(400).json({ message: "Reset password expired", success: false })
                    return
                }

            }

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

            if (!user.isVerified) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Account isn't verified. Please check email!",
                    success: false
                })
            }

            // Tao ma token
            var token = jwt.sign({ id: user.id }, config.secret, {
                // expiresIn: 86400
                expiresIn: config.jwtExpiration
            });

            // let refreshToken = await RefreshToken.createToken(user);

            // var authorities = []
            let authorities = []

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
            }
            console.log(authorities)
            res.status(200).json({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
                // refreshToken: refreshToken,
                success: true,
            });
        });
};

exports.googlelogin = (req, res) => {
    const { tokenId } = req.body

    client.verifyIdToken({ idToken: tokenId, audience: "741877373176-savm5ic6j7s14804jet71sqhbmc8a4il.apps.googleusercontent.com" })
        .then(response => {
            const { email_verified, name, email, picture } = response.payload
            // console.log(response.payload)
            if (email_verified) {
                User.findOne({ email })
                    .populate("roles", "-__v")
                    .exec((err, user) => {
                        if (err) {
                            return res.status(400).json({ message: err, success: false })
                        } else {
                            if (user) {
                                if (!user.isVerified) {
                                    user.isVerified = true
                                    user.save()
                                }

                                var token = jwt.sign({ id: user.id }, config.secret, {
                                    // expiresIn: 86400
                                    expiresIn: config.jwtExpiration
                                });
                                console.log(user)
                                let authorities = []
                                for (let i = 0; i < user.roles.length; i++) {
                                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
                                }

                                res.status(200).json({
                                    username: user.username,
                                    email: user.email,
                                    roles: authorities,
                                    accessToken: token,
                                    avt: user.avt,
                                    success: true,
                                });
                            } else {
                                let password = email + config.secret
                                const user = new User({
                                    username: name,
                                    email: email,
                                    password: bcrypt.hashSync(password, 8),
                                    avt: picture,
                                    isVerified: true
                                })

                                Role.findOne({ name: "user" }, (err, role) => {
                                    if (err) {
                                        res.status(500).json({ message: err, success: false })
                                        return
                                    }
                                    user.roles = [role._id]
                                    user.save()
                                    var token = jwt.sign({ id: user.id }, config.secret, {
                                        // expiresIn: 86400
                                        expiresIn: config.jwtExpiration
                                    });

                                    let authorities = []
                                    authorities.push('ROLE_USER')
                                    res.status(200).json({
                                        username: user.username,
                                        email: user.email,
                                        roles: authorities,
                                        accessToken: token,
                                        avt: user.avt,
                                        success: true,
                                    });
                                })

                            }
                        }
                    })
            }
        })
}

exports.facebooklogin = (req, res) => {
    const { userID, accessToken } = req.body

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`
    fetch(urlGraphFacebook, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => {
            const { email, name, picture } = response;
            var image = picture.data.url
            console.log(image)
            User.findOne({ email })
                .populate("roles", "-__v")
                .exec((err, user) => {
                    console.log(5555555)
                    console.log(user)
                    if (err) {
                        return res.status(400).json({ message: err, success: false })
                    } else {
                        if (user) {
                            if (!user.isVerified) {
                                user.isVerified = true
                                user.save()
                            }
                            var token = jwt.sign({ id: user.id }, config.secret, {
                                // expiresIn: 86400
                                expiresIn: config.jwtExpiration
                            });
                            console.log(111111111111111)
                            console.log(user)
                            let authorities = []
                            for (let i = 0; i < user.roles.length; i++) {
                                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
                            }

                            res.status(200).json({
                                username: user.username,
                                email: user.email,
                                roles: authorities,
                                accessToken: token,
                                avt: user.avt,
                                success: true,
                            });
                        } else {
                            let password = email + config.secret
                            const user = new User({
                                username: name,
                                email: email,
                                password: bcrypt.hashSync(password, 8),
                                avt: image,
                                isVerified: true
                            })

                            Role.findOne({ name: "user" }, (err, role) => {
                                if (err) {
                                    res.status(500).json({ message: err, success: false })
                                    return
                                }
                                user.roles = [role._id]
                                user.save()
                                console.log(2222)
                                console.log(user)
                                console.log(email)
                                var token = jwt.sign({ id: user.id }, config.secret, {
                                    // expiresIn: 86400
                                    expiresIn: config.jwtExpiration
                                });

                                let authorities = []
                                authorities.push('ROLE_USER')
                                res.status(200).json({
                                    username: user.username,
                                    email: user.email,
                                    roles: authorities,
                                    accessToken: token,
                                    avt: user.avt,
                                    success: true,
                                });

                            })

                        }
                    }
                })
        })

}
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

exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user.isVerified) {
            res.status(400).json({ message: "Account isn't verified. Please verified account!", success: false })
            return
        }

        console.log(process.env.HOST)
        if (!user) {
            res.status(400).json({ message: "User with given email doesn't exist", success: false })
            return
        }

        var password = Math.random().toString(36).slice(-8);

        let token = await Token.findOne({ userId: user._id })
        if (token) {
            token.delete()
        }
        token = await new Token({
            userId: user._id,
            token: bcrypt.hashSync(password, 8),
        }).save()
        console.log(token)
        user.password = token.token
        user.save()

        await sendResetPassword(user.email, password)

        res.status(200).json({ message: "password reset link sent to your email account", success: true })

    } catch (err) {
        res.status(err.status).json({ message: "An error occured", success: false })
        console.log(err)
    }
}

const getAuth = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId }).populate("roles");

        let authorities = []

        for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
        }

        if (!user)
            return {
                success: false,
                message: "Unauthenticated",
            };
        return {
            data: {
                // user: account.idUser,
                // role: account.role, 
                user: user,
                role: authorities,
            },
            success: true,
            message: "Get auth successfully",

        };
    } catch (error) {
        return {
            success: false,
            message: error.message,

        };
    }
};

exports.handleGetAuth = async (req, res) => {
    try {
        const token = req.body.token;
        // console.log(token)
        const result = await getAuth(token.id);
        console.log(result)
        if (result.success) {
            console.log(1)
            res.status(200).json({ data: result.data, success: true })
            return
        }
        res.json({ message: result.message, success: false })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err, success: false })
    }

}

// exports.resetPassword = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.userId);
//         if (!user) {
//             res.status(400).json({ message: "invalid link or expired", success: false })
//             return
//         }

//         const token = await Token.findOne({
//             userId: user._id,
//             token: req.params.token,
//         });
//         if (!token) {
//             res.status(400).json({ message: "invalid link or expired", success: false })
//             return
//         }

//         user.password = bcrypt.hashSync(req.body.password, 8)
//         // user.password=req.body.password

//         await user.save();
//         await token.delete();

//         res.status(200).json({ message: "password reset sucessfully.", success: true });
//     } catch (error) {
//         res.status(500).json({ message: "An error occured", success: false });
//         console.log(error);
//     }
// }

