jest.setTimeout(10000); // extend default timeout in case some tests take slightly longer 

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongodbServer;

// connect to MongoMemoryServer
beforeAll(async () => {
    mongodbServer = await MongoMemoryServer.create();
    const uri = mongodbServer.getUri();
    await mongoose.connect(uri);
})

// disconnect to MongoMemoryServer
afterAll(async () => {
    await mongoose.disconnect();
    await mongodbServer.stop();
})

// after each test, clear all collections in MongoMemoryServer
afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
})