const nodemailer = require("nodemailer")

const sendEmail = async (email, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        host: process.env.HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        }
    })

    const options = {
        from: process.env.USER,
        to: email,
        subject: subject,
        html: html
    };

    transporter.sendMail(options);

}

module.exports = sendEmail