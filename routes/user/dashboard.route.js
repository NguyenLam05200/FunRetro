const express = require('express');
const queryString = require('query-string');
var multer = require('multer');
var mkdirp = require('mkdirp');

const dashboardModel = require('../../models/user/dashboard.model');
const categoryModel = require('../../models/user/catColumn.model');
const config = require('../../config/default.json');
const {
    Schema
} = require('mongoose');
const db = require('../../utils/db');

const router = express.Router();


router.get('/', async function (req, res) {
    
    //console.log(nextQuery);
    const limit = 3;
    const page = +req.query.page || 1;
    if (page < 0) page = 1;

    const q = req.query.q;
    //const catName = req.params.catName;
    const filter = {createdBy: req.user._id};
    if (q)
        filter.name = new RegExp(q, 'i');
    // if (catName && catName != "All")
    //     filter.category = catName;
    //console.log(filter);

    //2 ham async nay chay song song k lien quan j den nhau =>
    const [list, total] = await Promise.all([
        dashboardModel.page(filter, limit, page),
        dashboardModel.count(filter)
    ])

    // const [list, total] = await Promise.all([
    //     productModel.pageByCat(req.params.catName, limit, page),
    //     productModel.countByCat(req.params.catName)
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
    // for (const c of res.locals.lcCategories) {
    //     if (c.name == req.params.catName) {
    //         c.isActive = true;
    //     }
    // }
    if(list.length != 0){
        for( const board of list){
            const curTemplate = board.template;
            var r = [];
            for(var i = 0; i< board.template.length; i++){
                const one = await categoryModel.getOne(curTemplate[i]);
                r.push(one);
            }
            board.temp = r;
        }
    }
    res.render('user/vwDashboards/home',{
        products: list,
        empty: list.length === 0,
        page_items,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages
    });
});

//------------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/byCat/:catName', async function (req, res) {
    const limit = config.pagination.limit;
    const page = +req.query.page || 1;
    if (page < 0) page = 1;

    const q = req.query.q;
    const catName = req.params.catName;
    const filter = {};
    if (q)
        filter.imgName = new RegExp(q, 'i');
    if (catName && catName != "All")
        filter.category = catName;
    //console.log(filter);

    //2 ham async nay chay song song k lien quan j den nhau =>
    const [list, total] = await Promise.all([
        productModel.page(filter, limit, page),
        productModel.count(filter)
    ])

    // const [list, total] = await Promise.all([
    //     productModel.pageByCat(req.params.catName, limit, page),
    //     productModel.countByCat(req.params.catName)
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

    //const list = await productModel.allByCat(req.params.catName);
    // list.map(function (p){
    //     p.f_price = '$' + p.price ;
    // })

    // const list = await productModel.pageByCat(req.params.catName, limit, page);
    res.render('vwProducts/byCat', {
        imgDirParents: process.env.PRODUCTS_IMAGE_DIR_FIXED,
        catName,
        products: list,
        empty: list.length === 0,
        page_items,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages
    });
});

router.get('/add', async function (req, res) {
    const listCatColumn = await categoryModel.getAll();
    var template = null;
    if (listCatColumn){
        template = [
            {_id: 1, name: 'Went Well - To Improve - Action Items'},
            {_id: 2, name: 'Start - Stop - Continue'}
        ]
    }
    // list.shift();
    // const q = req.query.catName;
    // for (let i = 0; i < list.length; i++) {
    //     if (list[i].name == q) {
    //         list[i].isSelected = true;
    //     } else {
    //         list[i].isSelected = false;
    //     }
    // }
    //fileImageName = null;
    res.render('user/vwDashboards/add', {
         categories: template,
         empty: listCatColumn.length === 0
    });
});

router.post('/add', async (req, res) => {
    var template = [];
    const listCatColumn = await categoryModel.getAll();
    if(req.body.selectTemplate === "1"){
        template.push(listCatColumn[0]._id);
        template.push(listCatColumn[1]._id);
        template.push(listCatColumn[2]._id);
    } else if(req.body.selectTemplate === "2"){
        template.push(listCatColumn[3]._id);
        template.push(listCatColumn[4]._id);
        template.push(listCatColumn[5]._id);
    }
    const auth = req.user._id;
    await dashboardModel.addOne(req.body, template, auth)
    res.redirect('/user/dashboard');
});

router.get('/details', async function (req, res) {
    //const list = await categoryModel.getAll();
    const id = req.query.id || -1;
    fileImageName = id;
    const product = await productModel.getOne(id);
    res.render('vwProducts/details', {
        product
    });
});

router.get('/edit', async function (req, res) {
    const list = await categoryModel.getAll();
    list.shift();
    const id = req.query.id || -1;
    fileImageName = id;
    _id = req.query.id || -1
    const product = await productModel.getOne(id);
    //console.dir(list[0]);
    for (let i = 0; i < list.length; i++) {
        if (list[i].name == product.category) {
            list[i].isSelected = true;
        } else {
            list[i].isSelected = false;
        }
    }
    //console.dir(list);
    //console.log(product);
    res.render('vwProducts/edit', {
        product,
        categories: list,
        empty: list.length === 0
    });
})

router.post('/del', async (req, res) => {
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
            await productModel.delOne(req.body);
            res.redirect('./byCat/All');
        }
    });
});

router.post('/update', async (req, res) => {
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
            await productModel.patchOne(req.body);
            res.redirect('./byCat/All');
        }
    });
    //await productModel.patchOne(req.body);
    //res.redirect('./');
});

module.exports = router;