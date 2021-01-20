const {
    db
} = require('../utils/db');
const {
    ObjectId
} = require('mongodb');
const nameCollection = "products";

var mongoose = require("mongoose");

var schemaProduct = new mongoose.Schema({
    _id: ObjectId,
    imgName: String,
    imgDir: String,
    price: Number,
    salePrice: Number,
    category: String,
    design: String,
    details: String
});


// compile schema to model
const Product = mongoose.model(nameCollection, schemaProduct);

module.exports = {
    ObjectId,
    all: async () => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.find({}).toArray();
        //console.dir(list);
        return list;
    },
    allByCat: async (catName) => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.find({
            "category": catName
        }).toArray();
        //console.log(list);
        return list;
    },
    addOne: async (data, _id, extension) => {
        //console.log("---" +_id);
        var newPro = new Product({
            _id: _id,
            imgName: data.imgName,
            imgDir: extension,
            price: data.price,
            salePrice: data.salePrice,
            category: data.selectCat,
            design: data.design,
            details: data.details
        });
        //console.log(newPro);
        const catCollection = db().collection(nameCollection);
        return await catCollection.insertOne(newPro);
    },
    getOne: async (id) => {
        const catCollection = db().collection(nameCollection);
        const one = await catCollection.findOne({
            _id: ObjectId(id)
        })
        return one;
    },
    patchOne: async (data) => {
        const catCollection = db().collection(nameCollection);
        return await catCollection.updateOne({
            "_id": ObjectId(data._id)
        }, {
            $set: {
                "imgName": data.imgName,
                "price": parseFloat(data.price.replace(",", ".")),
                "salePrice": parseFloat(data.salePrice.replace(",", ".")),
                "category": data.selectCat,
                "design" : data.design,
                "details": data.details
            }
        });
    },
    delOne: async (data) => {
        const catCollection = db().collection(nameCollection);
        var result = null;
        try {
            result = await catCollection.deleteOne({
                "_id": ObjectId(data._id)
            });
        } catch (e) {
            console.log(e);
        }
        return result;
    },
    // pageByCat: async (catName, limit, page) => {
    //     const proCollection = db().collection(nameCollection);
    //     const list = await proCollection.find({
    //             "category": catName
    //         }).skip((page - 1) * limit)
    //         .limit(limit).toArray();
    //     //console.log(list);
    //     return list;
    // },
    // countByCat: async (catName) => {
    //     const proCollection = db().collection(nameCollection);
    //     const list = await proCollection.countDocuments({"category":catName});
    //     //console.log(list);
    //     return list;
    // },
    // countAll: async () => {
    //     const proCollection = db().collection(nameCollection);
    //     const list = await proCollection.countDocuments({});
    //     //console.log(list);
    //     return list;
    // },
    // pageAll: async (limit, page) => {
    //     const proCollection = db().collection(nameCollection);
    //     const list = await proCollection.find({}).skip((page - 1) * limit)
    //         .limit(limit).toArray();
    //     //console.log(list);
    //     return list;
    // },
    page: async (filter,limit, page) => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.find(filter).skip((page - 1) * limit)
            .limit(limit).toArray();
        //console.log(list);
        return list;
    },
    count: async (filter) => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.countDocuments(filter);
        //console.log(list);
        return list;
    }
}