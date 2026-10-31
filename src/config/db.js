const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'unity_serve_db';

if (!uri) {
  console.error('[Database Error] MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db = null;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`[Database] Successfully connected to MongoDB database: "${dbName}"`);
    return db;
  } catch (error) {
    console.error('[Database Connection Failed]:', error.message);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

function getCollections() {
  const database = getDB();
  return {
    eventsCollection: database.collection('events'),
    joinedEventsCollection: database.collection('joined_events'),
    usersCollection: database.collection('users'),
  };
}

module.exports = {
  client,
  connectDB,
  getDB,
  getCollections,
};

