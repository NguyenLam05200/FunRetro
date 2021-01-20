const express = require('express');
const userModel = require('../models/user.model');
const config = require('../config/default.json');
const queryString = require('query-string');
var multer = require('multer');
var mkdirp = require('mkdirp');

const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const {
    Schema
} = require('mongoose');
const db = require('../utils/db');

const router = express.Router();


router.get('/users', async function (req, res) {
    const idQuery = req.query.id || null;
    const currentPer = req.user.permission;
    if (!(idQuery == null)) {
        const userDetails = await userModel.getOneUser(idQuery);
        res.render('vwUsers/profileUser', {
            userDetails,
            imgDirParents: process.env.PROFILES_IMAGE_DIR_FIXED
        });
    } else {
        const limit = config.pagination.limit;
        const page = +req.query.page || 1;
        if (page < 0) page = 1;
    
        const q = req.query.q;
        const catName = req.params.catName;
        const filter = {};
        //console.log(filter);
    
        //2 ham async nay chay song song k lien quan j den nhau =>
        const [list, total] = await Promise.all([
            userModel.pageUsers(filter, limit, page),
            userModel.countUsers(filter)
        ])
        //console.log(list);
    
        // const [list, total] = await Promise.all([
        //     userModel.pageByCat(req.params.catName, limit, page),
        //     userModel.countByCat(req.params.catName)
        // ])
    
        // nav paging, handle over page total
        const nPages = Math.ceil(total / config.pagination.limit);
        const page_items = [];
        const disabledItem = {
            value: '...',
            isActive: false,
            isDisabled: true
        }
        if (nPages < 15) {
            for (let i = 1; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        } else {
            for (let i = 1; i <= 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = page - 3; i <= page + 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = nPages - 2; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        }
        //---------------------------------------------------------------
        //console.log(page_items);
        for (const c of res.locals.lcCategories) {
            if (c.name == req.params.catName) {
                c.isActive = true;
            }
        }
    
        //const list = await userModel.allByCat(req.params.catName);
        // list.map(function (p){
        //     p.f_price = '$' + p.price ;
        // })
    
        // const list = await userModel.pageByCat(req.params.catName, limit, page);
        
        res.render('vwUsers/listUsers', {
            imgDirParents: process.env.userS_IMAGE_DIR_FIXED,
            catName,
            users: list,
            empty: list.length === 0,
            page_items,
            prev_value: page - 1,
            next_value: page + 1,
            can_go_prev: page > 1,
            can_go_next: page < nPages
        });
    }
    
});

router.get('/otherAdmins', async function (req, res) {
    const idQuery = req.query.id || null;
    const currentPer = req.user.permission;
    if (!(idQuery == null)) {
        const userDetails = await userModel.getOneAdmin(idQuery);
            if (userDetails.permission == "-1")
                userDetails.unBlock = true;
            else
                userDetails.unBlock = false;


            if (currentPer > userDetails.permission)
                userDetails.canBlock = true;
            else
                userDetails.canBlock = false;
        res.render('vwUsers/profile', {
            userDetails,
            imgDirParents: process.env.PROFILES_IMAGE_DIR_FIXED
        });
    } else {
        const limit = config.pagination.limit;
        const page = +req.query.page || 1;
        if (page < 0) page = 1;

        const q = req.query.q;
        const catName = req.params.catName;
        const filter = {};
        //console.log(filter);

        //2 ham async nay chay song song k lien quan j den nhau =>
        const [list, total] = await Promise.all([
            userModel.pageAdmins(filter, limit, page),
            userModel.countAdmins(filter)
        ])
        //console.log(list);

        // const [list, total] = await Promise.all([
        //     userModel.pageByCat(req.params.catName, limit, page),
        //     userModel.countByCat(req.params.catName)
        // ])

        // nav paging, handle over page total
        const nPages = Math.ceil(total / config.pagination.limit);
        const page_items = [];
        const disabledItem = {
            value: '...',
            isActive: false,
            isDisabled: true
        }
        if (nPages < 15) {
            for (let i = 1; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        } else {
            for (let i = 1; i <= 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = page - 3; i <= page + 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = nPages - 2; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        }
        //---------------------------------------------------------------
        //console.log(page_items);
        for (const c of res.locals.lcCategories) {
            if (c.name == req.params.catName) {
                c.isActive = true;
            }
        }

        //const list = await userModel.allByCat(req.params.catName);
        // list.map(function (p){
        //     p.f_price = '$' + p.price ;
        // })

        // const list = await userModel.pageByCat(req.params.catName, limit, page);
        for (var i = 0; i < list.length; i++) {
            //console.log(list[i]);
            if (list[i].permission == "0")
                list[i].position = "Undefined";
            else if (list[i].permission == "1")
                list[i].position = "Low";
            else if (list[i].permission == "2")
                list[i].position = "Medium";
            else if (list[i].permission == "3")
                list[i].position = "Master";
            else
                list[i].position = "Blocking"; //-1

            if (list[i].permission == "-1")
                list[i].unBlock = true;
            else
                list[i].unBlock = false;


            if (currentPer > list[i].permission)
                list[i].canBlock = true;
            else
                list[i].canBlock = false;

        }
        //console.log("-----------------------------------\n");
        //console.log(list);
        res.render('vwUsers/listAdmins', {
            imgDirParents: process.env.userS_IMAGE_DIR_FIXED,
            catName,
            users: list,
            empty: list.length === 0,
            page_items,
            prev_value: page - 1,
            next_value: page + 1,
            can_go_prev: page > 1,
            can_go_next: page < nPages
        });
    }
});

router.get('/blockAdmin', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        if (req.user.permission <= idBlock) {
            res.send("Can block because your level is not higher this user.");
        } else {
            await userModel.blockAdmin(idBlock);
            res.redirect('./otherAdmins');
        }
    }

});
router.post('/blockAdmin', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        if (req.user.permission <= idBlock) {
            res.send("Can block because your level is not higher this user.");
        } else {
            await userModel.blockAdmin(idBlock);
            res.redirect('./otherAdmins');
        }
    }

});
router.get('/unblockAdmin', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idUnblock null");
    else {
        if (req.user.permission <= idBlock) {
            res.send("Can unblock because your level is not higher this user.");
        } else {
            await userModel.unblockAdmin(idBlock);
            res.redirect('./otherAdmins');
        }
    }

});
router.post('/unblockAdmin', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idUnblock null");
    else {
        if (req.user.permission <= idBlock) {
            res.send("Can unblock because your level is not higher this user.");
        } else {
            await userModel.unblockAdmin(idBlock);
            res.redirect('./otherAdmins');
        }
    }

});


router.get('/blockUser', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        await userModel.blockUser(idBlock);
        res.redirect('./users');
    }

});
router.post('/blockUser', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        await userModel.blockUser(idBlock);
        res.redirect('./users');
    }

});
router.get('/unblockUser', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        await userModel.unblockUser(idBlock);
        res.redirect('./users');
    }

});
router.post('/unblockUser', async function (req, res) {
    const idBlock = req.query.id || null;
    if (idBlock == null)
        res.send("idBlock null");
    else {
        await userModel.unblockUser(idBlock);
        res.redirect('./users');
    }

});
router.post('/search', async function (req, res) {
    const search = req.body.table_search || null;
    if (search == null)
        res.send("idBlock null");
    else {
        //const list = await userModel.searchAdmin(search);
        const valueSearch = new RegExp(search, 'i');
        const currentPer = req.user.permission;
        const limit = config.pagination.limit;
        const page = +req.query.page || 1;
        if (page < 0) page = 1;

        const catName = req.params.catName;
        const filter = {username: {$regex: valueSearch}};
        //console.log(filter);

        //2 ham async nay chay song song k lien quan j den nhau =>
        const [list, total] = await Promise.all([
            userModel.pageAdmins(filter, limit, page),
            userModel.countAdmins(filter)
        ])
        //console.log(list);

        // const [list, total] = await Promise.all([
        //     userModel.pageByCat(req.params.catName, limit, page),
        //     userModel.countByCat(req.params.catName)
        // ])

        // nav paging, handle over page total
        const nPages = Math.ceil(total / config.pagination.limit);
        const page_items = [];
        const disabledItem = {
            value: '...',
            isActive: false,
            isDisabled: true
        }
        if (nPages < 15) {
            for (let i = 1; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        } else {
            for (let i = 1; i <= 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = page - 3; i <= page + 3; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
            page_items.push(disabledItem);
            for (let i = nPages - 2; i <= nPages; i++) {
                const item = {
                    value: i,
                    isActive: i === page
                }
                page_items.push(item);
            }
        }
        //---------------------------------------------------------------
        //console.log(page_items);
        for (const c of res.locals.lcCategories) {
            if (c.name == req.params.catName) {
                c.isActive = true;
            }
        }

        //const list = await userModel.allByCat(req.params.catName);
        // list.map(function (p){
        //     p.f_price = '$' + p.price ;
        // })

        // const list = await userModel.pageByCat(req.params.catName, limit, page);
        for (var i = 0; i < list.length; i++) {
            //console.log(list[i]);
            if (list[i].permission == "0")
                list[i].position = "Undefined";
            else if (list[i].permission == "1")
                list[i].position = "Low";
            else if (list[i].permission == "2")
                list[i].position = "Medium";
            else if (list[i].permission == "3")
                list[i].position = "Master";
            else
                list[i].position = "Blocking"; //-1

            if (list[i].permission == "-1")
                list[i].unBlock = true;
            else
                list[i].unBlock = false;


            if (currentPer > list[i].permission)
                list[i].canBlock = true;
            else
                list[i].canBlock = false;

        }
        //console.log("-----------------------------------\n");
        //console.log(list);
        res.render('vwUsers/listAdmins', {
            imgDirParents: process.env.userS_IMAGE_DIR_FIXED,
            catName,
            users: list,
            empty: list.length === 0,
            page_items,
            prev_value: page - 1,
            next_value: page + 1,
            can_go_prev: page > 1,
            can_go_next: page < nPages
        });
    
    }

});

module.exports = router;