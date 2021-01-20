require("dotenv").config();
const express = require('express');
const session = require('express-session'); //thường thì express.session là đủ nhưng express 4 k có nên phải install như vầy

const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use('/public', express.static("public"));
app.use(express.static('public'));
app.use(express.static(process.env.PRODUCTS_IMAGE_DIR));
app.use(express.static(process.env.PROFILES_IMAGE_DIR));
app.use(express.static(process.env.PROFILES_IMAGE_DIR_USER));
app.use(express.static(process.env.PROFILES_IMAGE_DIR_ADMIN));



//passport
const passport =  require('./passport');
//passport middlewares
app.use(session({ secret: process.env.SESSION_SECRET || 'keyboard cat'})); //để encrypt session
app.use(passport.initialize()); //đăng kí gói passport để express sd cho đúng
app.use(passport.session()); //đăng kí express session

//require('./middlewares/session.mdw')(app); // require ra function()

require('./middlewares/view.mdw')(app); // require ra function()

//phân chia vùng view có thể xem (session)
require('./middlewares/locals.mdw')(app); // require ra function()


//Routes

//Home of view User --
app.get('/', function (req, res) {
    res.render('user/home');
})
app.get('/user', function (req, res) {
    res.render('user/home');
})
app.get('/user/home', function (req, res) {
    res.render('user/home');
})

//Home of view Admin --
app.get('/admin', function (req, res) {
    res.render('homeAdmin',{
        layout: "mainAdmin"
    });
})
app.get('/admin/contact', function (req, res) {
    res.render('contactAdmin',{
        layout: "mainAdmin"
    });
})

//view About - User
app.get('/user/about', function (req, res) {
    res.render('user/about');
})

app.get('/features', function (req, res) {
    res.render('features');
})

//view Contact - User
app.get('/user/contact', function (req, res) {
    res.render('user/contact');
})
app.get('/user/contact', function (req, res) {
    res.render('user/contact');
})

//view Features - User
app.get('/user/features', function (req, res) {
    res.render('user/features');
})

//view Pricing - User
app.get('/user/pricing', function (req, res) {
    res.render('user/pricing');
})
const restrict = require('./middlewares/auth.mdw')

// thể loại
app.use('/admin/categories',restrict, require('./routes/category.route'));

// sản phẩm
app.use('/admin/products',restrict, require('./routes/product.route'));


// Phần khách hàng:
const restrictUser = require('./middlewares/auth.mdw')
// đăng kí, đăng nhập, profile của Người dùng
app.use('/user/account', require('./routes/user/account.route'));
app.use('/user/dashboard', restrictUser, require('./routes/user/dashboard.route'));
app.use('/user/teams', restrictUser, require('./routes/user/team.route'));
app.use('/user/analytics', restrictUser, require('./routes/user/analytics.route'));
app.use('/user/integration', restrictUser, require('./routes/user/integration.route'));
app.use('/user/subscription', restrictUser, require('./routes/user/billing.route'));
//--khách hàng--

//Phần quản trị viên:
// đăng kí, đăng nhập, profile của quản lí
app.use('/admin/account', require('./routes/account.route'));
// quản lí các khách hàng và quản trị viên cấp thấp hơn
app.use('/admin/management',restrict, require('./routes/user.route'));
//--quản trị viên--

// chạy hết, nếu err thì quăng vô đây xử lí
require('./middlewares/errors.mdw')(app); // require ra function()


var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Server User is running at http://localhost:${PORT}`);
    console.log(`Server Admin is running at http://localhost:${PORT}/admin`);
})