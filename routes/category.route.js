const express = require('express');
const {
    Schema
} = require('mongoose');
const db = require('../utils/db');
const categoryModel = require('../models/category.model');

const router = express.Router();

router.get('/', async function (req, res) {
    const list = await categoryModel.getAll();

    res.render('vwCategories/list', {
        categories: list,
        empty: list.length === 0
    });
})

router.get('/add', function (req, res) {
    res.render('vwCategories/add');
})

router.post('/add', async (req, res) => {
    const result = await categoryModel.addOne(req.body);
    //console.log(result);
    res.redirect('./');
});

//chưa xử lí view error nếu query != String of 12 bytes or a string of 24 hex characters 
router.get('/edit', async function (req, res) {
    const id = req.query.id || -1;
    const category = await categoryModel.getOne(id);
    // if(category == null){
    //     return res.send("Query string is not invalid");
    // } else {
    //     return res.render('vwCategories/edit', {
    //         category
    //     });
    // }
    res.render('vwCategories/edit', {
        category
    });
})

router.post('/del', async (req, res) => {
    await categoryModel.delOne(req.body);
    res.redirect('./');
});

router.post('/update', async (req, res) => {
    await categoryModel.patchOne(req.body);
    res.redirect('./');
});

module.exports = router;