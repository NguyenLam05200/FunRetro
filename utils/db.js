const { MongoClient } = require("mongodb");
const dbName = process.env.databaseName;
const URI = process.env.URI;
// Create a new MongoClient
const client = new MongoClient(URI, { useUnifiedTopology: true });

let database;

async function connectDb(){
    await client.connect();
    // Establish and verify connection
    database = await client.db(dbName);
    console.log('Db connected!');
}

console.log('RUNNING DB...');

connectDb();

const db = () => database;

module.exports.db = db;