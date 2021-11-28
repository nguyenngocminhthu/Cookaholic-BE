const multer = require('multer')

const cloudinary = require('cloudinary').v2

const { CloudinaryStorage } = require('multer-storage-cloudinary')

const cloudinaryConfig = require('../config/cloudinary.config')

cloudinary.config({
    cloud_name: cloudinaryConfig.CLOUDINARY_HOST,
    api_key: cloudinaryConfig.CLOUDINARY_API_KEY,
    api_secret: cloudinaryConfig.CLOUDINARY_API_SERCET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "folder name",
        format: async () => "png",
        public_id: (req, file) => file.filename,
    }
})

const parser = multer({ storage: storage })

module.exports = parser