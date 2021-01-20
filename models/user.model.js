const bcrypt = require('bcryptjs');

const {
    db
} = require('../utils/db');
const {
    ObjectId
} = require('mongodb');
const nameCollection = "admins";
const nameCollectionToken = "tokens";
const nameCollectionUsers = "users"

var mongoose = require("mongoose");

// var schemaAdmin = new mongoose.Schema({
//     username: String,
//     password_hash: String,
//     email: String,
//     dob: Date,
//     permission: Number
// });

var schemaAdmin = new mongoose.Schema({
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
const User = mongoose.model(nameCollection, schemaAdmin);
const Token = mongoose.model(nameCollectionToken, schemaToken);

module.exports = {
    ObjectId,
    all: async () => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.find({}).toArray();
        //console.dir(list);
        return list;
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
    getOneAdmin: async (id) => {
        const userCollection = db().collection(nameCollection);
        const one = await userCollection.findOne({
            _id: ObjectId(id)
        })
        return one;
    },
    getOneUser: async (id) => {
        const userCollection = db().collection(nameCollectionUsers);
        const one = await userCollection.findOne({
            _id: ObjectId(id)
        })
        return one;
    },
    getOneToken: async (token) => {
        const tokenCollection = db().collection(nameCollectionToken);
        const one = await tokenCollection.findOne({
            token: token
        })
        return one;
    },
    findByUsername: async (username) => {
        const userCollection = db().collection(nameCollection);
        const rows = await userCollection.findOne({
            username: username
        })
        if (rows == null) {
            return null;
        }
        return rows;
    },
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
    findOneByFilter: async (filter) => {
        const userCollection = db().collection(nameCollection);
        const rows = await userCollection.findOne(filter)
        if (rows == null) {
            return null;
        }
        return rows;
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
    blockAdmin: async (_id) => {
        const userCollection = db().collection(nameCollection);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "permission": "-1"
            }
        });
    },
    unblockAdmin: async (_id) => {
        const userCollection = db().collection(nameCollection);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "permission": "1"
            }
        });
    },
    blockUser: async (_id) => {
        const userCollection = db().collection(nameCollectionUsers);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "isActive": false
            }
        });
    },
    unblockUser: async (_id) => {
        const userCollection = db().collection(nameCollectionUsers);
        return await userCollection.updateOne({
            "_id": ObjectId(_id)
        }, {
            $set: {
                "isActive": true
            }
        });
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
    },
    delOne: async (id) => {
        const userCollection = db().collection(nameCollection);
        var result = null;
        try {
            result = await userCollection.deleteOne({
                "_id": ObjectId(id)
            });
        } catch (e) {
            console.log(e);
        }
        return result;
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
        const user = userCollection.findOne({
            _id: ObjectId(id)
        });
        //console.dir(user);
        return user;
    },
    pageUsers: async (filter,limit, page) => {
        const proCollection = db().collection(nameCollectionUsers);
        const list = await proCollection.find(filter).skip((page - 1) * limit)
            .limit(limit).toArray();
        //console.log(list);
        return list;
    },
    countUsers: async (filter) => {
        const proCollection = db().collection(nameCollectionUsers);
        const list = await proCollection.countDocuments(filter);
        //console.log(list);
        return list;
    },
    pageAdmins: async (filter,limit, page) => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.find(filter).skip((page - 1) * limit)
            .limit(limit).toArray();
        //console.log(list);
        return list;
    },
    countAdmins: async (filter) => {
        const proCollection = db().collection(nameCollection);
        const list = await proCollection.countDocuments(filter);
        //console.log(list);
        return list;
    },
    searchAdmin: async (search) => {
        const proCollection = db().collection(nameCollection);
        const valueSearch = new RegExp(search, 'i');
        const list = await proCollection.find({username: {$regex: valueSearch}}).toArray();
        //console.log(list);
        return list;
    }

}