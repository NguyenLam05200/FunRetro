const express = require('express');
const queryString = require('query-string');
var multer = require('multer');
var mkdirp = require('mkdirp');

const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');
const config = require('../config/default.json');
const {
    Schema
} = require('mongoose');
const db = require('../utils/db');

const router = express.Router();


//multer
let _id;
let extension = null;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        mkdirp(process.env.PRODUCTS_IMAGE_DIR + '\\' + _id.toString(), function (err) {

            // path exists unless there was an error

        });
        if (file.fieldname === "main") {
            cb(null, process.env.PRODUCTS_IMAGE_DIR + '\\' + _id.toString())
        } else if (file.fieldname === "details1") {
            cb(null, process.env.PRODUCTS_IMAGE_DIR + '\\' + _id.toString())
        } else if (file.fieldname === "details2") {
            cb(null, process.env.PRODUCTS_IMAGE_DIR + '\\' + _id.toString())
        }
        //@ts-checkcb(null, 'public/images/products')
    },
    filename: function (req, file, cb) {
        //console.log("filenam: " + file.originalname);
        //if (file.originalname == '') console.log("null nha");
        //console.log("name truoc: " + fileImageName);
        if (file.fieldname === "main") {
            // if (mainImageName == null) {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     mainImageName = 'main' + '.' + extension;
            // } else {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     mainImageName += '.' + extension;
            // }
            let extArray = file.mimetype.split("/");
            extension = extArray[extArray.length - 1];
            cb(null, "main" + "." + extension)
        } else if (file.fieldname === "details1") {
            // if (details1ImageName == null) {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     details1ImageName = 'details1' + '.' + extension;
            // } else {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     details1ImageName += '.' + extension;
            // }
            let extArray = file.mimetype.split("/");
            extension = extArray[extArray.length - 1];
            cb(null, "details1" + "." + extension)
        } else if (file.fieldname === "details2") {
            // if (details2ImageName == null) {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     details2ImageName = 'details2' + '.' + extension;
            // } else {
            //     let extArray = file.mimetype.split("/");
            //     extension = extArray[extArray.length - 1];
            //     details2ImageName += '.' + extension;
            // }
            let extArray = file.mimetype.split("/");
            extension = extArray[extArray.length - 1];
            cb(null, "details2" + "." + extension)
        } 

        //console.log("name sau: " + fileImageName);

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
}).fields([{
    name: "main",
    maxCount: 1
}, {
    name: "details1",
    maxCount: 1
}, {
    name: "details2",
    maxCount: 1
}]); // imgProduct is name in view vwProducts/add.hbs

router.get('/', async function (req, res) {
    const limit = config.pagination.limit;
    const page = +req.query.page || 1;
    if (page < 0) page = 1;
    const q = req.query.q;
    const filter = {};
    if (q)
        filter.imgName = new RegExp(q, 'i');
    const [list, total] = await Promise.all([
        productModel.page(filter, limit, page),
        productModel.count(filter)
    ])



    // const total = await productModel.countByCat(req.params.catName);
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
    //console.log(req.query);
    // const list = await productModel.pageByCat(req.params.catName, limit, page);
    const nextQuery = {
        ...req.query,
        page: page + 1
    }; //...req.query: lấy all thuộc tính object query hiện tại đổ vào nextQuery, sửa thuộc tính page thành page mới.
    const prevQuery = {
        ...req.query,
        page: page - 1
    };
    //console.log(nextQuery);
    res.render('vwProducts/list', {
        products: list,
        empty: list.length === 0,
        page_items,
        prev_value: page - 1,
        prevPageQueryString: queryString.stringify(prevQuery), //=?pagep{{prev_value}}
        next_value: page + 1,
        nextPageQueryString: queryString.stringify(nextQuery), //
        can_go_prev: page > 1,
        can_go_next: page < nPages
    });
});

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
    const list = await categoryModel.getAll();
    list.shift();
    const q = req.query.catName;
    for (let i = 0; i < list.length; i++) {
        if (list[i].name == q) {
            list[i].isSelected = true;
        } else {
            list[i].isSelected = false;
        }
    }
    fileImageName = null;
    res.render('vwProducts/add', {
        categories: list,
        empty: list.length === 0
    });
});

router.post('/add', async (req, res) => {
    _id = new productModel.ObjectId();
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
            //console.log(req.body);
            //console.log(fileImageName);
            const result = await productModel.addOne(req.body, _id, extension);
            res.redirect('./byCat/All');
        }
    });
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