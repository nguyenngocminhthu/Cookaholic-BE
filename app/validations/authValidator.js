const Joi = require("joi")

signupValidator = (req, res, next) => {

    const rule = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
        email: Joi.string().required().email()
    })

    const { error } = rule.validate(req.body)

    console.log(error)

    if (error)
        return res.status(422).json(error.details[0].message);

    next()
}

signinValidator = (req, res, next) => {

    const rule = Joi.object({
        username: Joi.string().required(), // change to email
        password: Joi.string().required(),
    })

    const { error } = rule.validate(req.body)

    console.log(error)

    if (error)
        return res.status(422).json(error.details[0].message);

    next()
}

module.exports.signupValidator = signupValidator
module.exports.signinValidator = signinValidator
