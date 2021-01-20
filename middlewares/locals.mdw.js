const categoryModel = require('../models/category.model');

//chứa middleware trong thân file app.js
module.exports = function(app){
    app.use(function (req, res, next) {
        if(req.session.isAuthenticated === null){
            req.session.isAuthenticated = false;
        }
        // res.locals.lcIsAuthenticated = req.session.isAuthenticated ;
        // res.locals.lcAuthUser = req.session.authUser;
        //res.locals.lcIsAuthenticated = !req.user.anonymous ;
      
        res.locals.lcAuthUser = req.user;
        res.locals.productsImageDir = process.env.PRODUCTS_IMAGE_DIR;
        res.locals.profilesImageDir = process.env.PROFILES_IMAGE_DIR;

        next();
    })
    
    
    
    
    //middleware:để đầu, all api đều phải đi qua nó hết r mới làm gì làm
    app.use(async function (req, res, next) {
        const rows = await categoryModel.getAll();
        //console.log(rows);
        res.locals.lcCategories = rows; //lc: local, 1 req whill return each res.locals diffrent.
        //console.log("------------------------------------");
        //console.log(res.locals.lcCategories);
        next();
    })
}