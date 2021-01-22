const {
    db
} = require('../../utils/db');
const {
    ObjectId
} = require('mongodb');
const nameCollection = "catColumn";

var mongoose = require("mongoose");

var schemaCategoryColumn = new mongoose.Schema({
    _id: ObjectId,
    name: String
});


// compile schema to model
const catColumn = mongoose.model(nameCollection, schemaCategoryColumn);

module.exports = {
    ObjectId,
    getAll: async () => {
        const catColumnCollection = db().collection(nameCollection);
        const list = await catColumnCollection.find({}).toArray();
        //console.dir(list);
        return list;
    },
    getOne: async (id) => {
        const catColumnCollection = db().collection(nameCollection);
        const one = await catColumnCollection.findOne({_id: id});
        //console.dir(list);
        return one;
    }
}