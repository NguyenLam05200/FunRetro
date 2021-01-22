const bcrypt = require('bcryptjs');

const {
    db
} = require('../../utils/db');
const catColumnModel = require('./catColumn.model');
const {
    ObjectId
} = require('mongodb');
const nameCollection = "dashboards";

var mongoose = require("mongoose");

var schemaDashboard = new mongoose.Schema({
    name: String,
    maxVote: {
        type: Number,
        default: 6
    },
    template: [mongoose.Schema.Types.ObjectId],
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: nameCollection },
    createdAt: { type: Date, required: true, default: Date.now }

});

const schemaToken = new mongoose.Schema({
    _boardId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: nameCollection },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

// compile schema to model
const Board = mongoose.model(nameCollection, schemaDashboard);

module.exports = {
    ObjectId,
    findOneByEmail: async (email) => {
        const boardCollection = db().collection(nameCollection);
        const rows = await boardCollection.findOne({
            email: email
        })
        if (rows == null) {
            return null;
        }
        return rows;
    },
    addOne: async (entity, template, auth) => {
        //console.log("---" +_id);
        var newboard = new Board({
            name: entity.name,
            maxVote: entity.maxVote,
            template: template,
            createdBy: auth
        });
        //console.log(newPro);
        const boardCollection = db().collection(nameCollection);
        return await boardCollection.insertOne(newboard);
    },
    getAllByFilter: async (filter) => {
        const userCollection = db().collection(nameCollection);
        const list = await userCollection.find(filter).toArray();
        if (!list) {
            return null;
        }
        return list;
    },
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