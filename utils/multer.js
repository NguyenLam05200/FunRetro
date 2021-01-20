var multer = require('multer');
const productModel = require('../models/product.model');

//multer
let _id;
let extension = null;
let fileImageName = null;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.PRODUCTS_IMAGE_DIR)
        //@ts-checkcb(null, 'public/images/products')
    },
    filename: function (req, file, cb) {
        //console.log("filenam: " + file.originalname);
        //if (file.originalname == '') console.log("null nha");
        //console.log("name truoc: " + fileImageName);
        if (fileImageName == null) {
            let extArray = file.mimetype.split("/");
            extension = extArray[extArray.length - 1];
            _id = new productModel.ObjectId();
            fileImageName = _id.toString() + '.' + extension;
        } else{
            let extArray = file.mimetype.split("/");
            extension = extArray[extArray.length - 1];
            fileImageName+=  '.' + extension;
        }
        //console.log("name sau: " + fileImageName);
        cb(null, fileImageName)
    }
});
var MulterError = multer.MulterError;
module.exports = {
    MulterError,
    upload: multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif") {
                cb(null, true)
            } else {
                return cb(new Error('Only image are allowed!'))
            }
        }
    }).single("imgProduct")
}