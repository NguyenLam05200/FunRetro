const express = require('express');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer')
const userModel = require('../../models/user/user.model')
const config = require('../../config/default.json');
const passport = require('../../passport');
var multer = require('multer');

const router = express.Router();

router.get('/login', async function (req, res) {
    let err = "";
    let notification = "";

    if (req.query.err === "9") {
        notification = 'Invalid username or password.Please try again!';
    }

    if (req.query.notification === "1") {
        notification = 'Your account is not verified!';
        err = "Your account is not verified!";
    }
    if (req.query.notification === "2") {
        notification = 'The account has been verified.';
    }
    if (req.query.notification === "3") {
        notification = 'Your account is blocked or not be granted admin. Please check again!';
    }
    
    res.render('user/vwAccounts/login', {
        notification,
        layout: false,
        err
    });
});

//session
const restrict = require('../../middlewares/authUser.mdw')
//session

//use npm passport
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/account/login?err=9',
    failureFlash: false
}))
router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('./login'); //đang ở đâu thì đá về chỗ đó
});



//forgot password --//
router.get('/forgot-password', async function (req, res) {
    let err = "";
    if (req.query.err === "1") {
        err = 'Invalid username or password.Please try again!';
    }
    res.render('user/vwAccounts/forgot-password', {
        layout: false,
        err
    });
});
//// not edited post
router.post('/forgot-password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: './login?err=1',
    failureFlash: false
}))
//-- forgot password//


//register --//
router.get('/register', async function (req, res) {
    res.render('user/vwAccounts/register', {
        layout: false,
    });
});

router.post('/register', async function (req, res) { 
    //console.log(req.body.email);
    const user = await userModel.findOneByEmail(req.body.email );
    //console.log(user);
        // Make sure user doesn't already exist
    if (user) return res.status(400).render('user/vwAccounts/register', {
        layout: false,
        notification: "The email address you have entered is already associated with another account. Please register another one!"
    });
    // Create and save the user
    //user = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
    const dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
    const entity = {
        username: req.body.name,
        password_hash,
        email: req.body.email,
        dob,
        permission: 0
    }
    await userModel.addOne(entity);
    const newUser = await userModel.findOneByEmail(req.body.email)
    const entityToken = {
        _userId: newUser._id,
        token: crypto.randomBytes(16).toString('hex')
    }
    await userModel.addOneToken(entityToken)
    //console.log(newUser.email);
    var transporter = nodemailer.createTransport({ service: "Gmail", auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
    var mailOptions = { from: 'funretrovn@gmail.com', to: newUser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/account/confirmation\/' + entityToken.token + '.\n' };
    transporter.sendMail(mailOptions, function (err) {
        if (err) { 
            //console.log("done 3");
            return res.status(500).send({ msg: err.message }); }
        //console.log("done 4");
        res.status(200).render('user/vwAccounts/login', {
            layout: false,
            notification: 'A verification email has been sent to ' + newUser.email + '. Please confirm to go on login!',
        });
    });
});

router.get('/confirmation/:tokenQuery', async function (req, res) {
    const tokenQuery = req.params.tokenQuery;

    // Find a matching token
    const token = await userModel.getOneToken(tokenQuery);

    if (!token) return res.status(400).render('user/vwAccounts/register', {
        layout: false,
        notification: "We were unable to find a valid token. Your token my have expired."
    });
    // If we found a token, find a matching user
    const user = await userModel.findOneByFilter({ _id: token._userId})
    if (!user) return res.status(400).render('user/vwAccounts/register', {
        layout: false,
        notification: "We were unable to find a user for this token. Please register again!"
    });
    if (user.isVerified) return res.status(400).render('user/vwAccounts/login', {
        layout: false,
        notification: "This user has already been verified.",
    });
    // Verify and save the user
    await userModel.verifyOK(user._id);
    user.isVerified = true;
    res.status(200).redirect(`/user/account/login?notification=2`);
});

//chua xu li gui lai ma xac nhan tai khoan!
router.post('/register/resend', async function (req, res) {
    const dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const password_hash = bcrypt.hashSync(req.body.password, config.authentication.saltRounds);
    const entity = {
        username: req.body.username,
        password_hash,
        email: req.body.email,
        dob,
        permission: 0
    }
    await userModel.addOne(entity);
    res.render('user/vwAccounts/register', {
        layout: false,
    });
});
//-- register//


//Profile --//

router.get('/profile', restrict, async function (req, res) {
    //console.log(process.env.PROFILES_IMAGE_DIR);
    //console.log(req.user);
 
    res.render('user/vwAccounts/profile',{
        imgDirParents: process.env.PROFILES_IMAGE_DIR_FIXED,
    });
});

//multer
let _id;
let extension = null;
var fileImageName = null;
var isHasAvatar;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.PROFILES_IMAGE_DIR_USER)
        //@ts-checkcb(null, 'public/images/products')
    },
    filename: function (req, file, cb) {
        //console.log("filenam: " + file.originalname);
        //if (file.originalname == '') console.log("null nha");
        //console.log("name truoc: " + fileImageName);
        let extArray = file.mimetype.split("/");
        extension = extArray[extArray.length - 1];
        _id = req.user._id;
        fileImageName = _id.toString() + '.' + extension;
        if(!req.user.isHasAvatar){
            isHasAvatar = true;
            //console.log(isHasAvatar);
        }
        //console.log("name sau: " + fileImageName);
        cb(null, fileImageName)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/bmp" || file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/gif") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("imgAvatar"); // imgProduct is name in view vwProducts/add.hbs

router.post('/updateProfile', async (req, res) => {
    //console.log(req.body);
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.log({
                "kq": 0,
                "errMsg": "A multer error occured when uploading."
            });
        } else if (err) {
            console.log({
                "kq": 0,
                "errMsg": "An unknown error occurred when uploading." + err
            });
        } else {
            //console.log(fileImageName);
            //console.log(req.body);
            await userModel.patchOne(req.user._id, req.body, extension);
            res.redirect('profile');
        }
    });
    //await productModel.patchOne(req.body);
    //res.redirect('./');
});
//-- Profile//


module.exports = router;