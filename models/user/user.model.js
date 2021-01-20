const bcrypt = require('bcryptjs');

const {
    db
} = require('../../utils/db');
const {
    ObjectId
} = require('mongodb');
const nameCollection = "users";
const nameCollectionToken = "tokenUsers";

var mongoose = require("mongoose");

var schemaUser = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    phone: { type: Number, default: null },
    avatar: { type: String, default: "" },
    isActive: {type: Boolean, default: true},
    permission: Number,
    dob: Date,
    password_hash: String,
    passwordResetToken: String,
    passwordResetExpires: Date
});

const schemaToken = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: nameCollection },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

// compile schema to model
const User = mongoose.model(nameCollection, schemaUser);
const Token = mongoose.model(nameCollectionToken, schemaToken);

module.exports = {
    ObjectId,
    findOneByEmail: async (email) => {
        const userCollection = db().collection(nameCollection);
        const rows = await userCollection.findOne({
            email: email
        })
        if (rows == null) {
            return null;
        }
        return rows;
    },
    addOne: async (entity) => {
        //console.log("---" +_id);
        var newUser = new User({
            username: entity.username,
            password_hash: entity.password_hash,
            email: entity.email,
            phone: entity.phone,
            dob: entity.dob,
            permission: entity.permission
        });
        //console.log(newPro);
        const userCollection = db().collection(nameCollection);
        return await userCollection.insertOne(newUser);
    },
    addOneToken: async (entity) => {
        //console.log("---" +_id);
        var newToken = new Token({
            _userId: entity._userId,
            token: entity.token
        });
        //console.log(newPro);
        const tokenCollection = db().collection(nameCollectionToken);
        return await tokenCollection.insertOne(newToken);
    },
    getOneToken: async (token) => {
        const tokenCollection = db().collection(nameCollectionToken);
        const one = await tokenCollection.findOne({
            token: token
        })
        return one;
    },
    verifyOK: async (_id) => {
        const userCollection = db().collection(nameCollection);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "isVerified": true
            }
        });
    },
    findOneByFilter: async (filter) => {
        const userCollection = db().collection(nameCollection);
        const rows = await userCollection.findOne(filter)
        if (rows == null) {
            return null;
        }
        return rows;
    },
    /**
     * Check for valid username and password. Return user info if is valid.
     * @param {*} username 
     * @param {*} password 
     */
    checkCredential: async (email, password) => {
        const userCollection = db().collection(nameCollection);
        const user = await userCollection.findOne({
            email
        });
        if (!user) return false;
        let checkPassword = await bcrypt.compare(password, user.password_hash);
        if (checkPassword) {
            return user;
        }
        return false;
    },
    getUser: (id) => {
        const userCollection = db().collection(nameCollection);
        var user = null;
        user = userCollection.findOne({
            _id: ObjectId(id)
        });
        return user;
    },
    patchOne: async (_id, entity, avatar) => {
        const userCollection = db().collection(nameCollection);
        //console.log(_id);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "username": entity.username,
                //"password_hash": entity.password_hash,
                "email": entity.email,
                "avatar": avatar,
                "dob": entity.dob,
                "phone": entity.phone
                //"permission": parseInt(entity.permission)
            }
        });
    }
}