//load environment variables
require('dotenv').config();

//access environment variables
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

console.log(dbUser, dbPassword); //debug

//import libraries
const express = require('express');
const mongoose = require('mongoose');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

//initialise Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//create express app
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//connect to database
mongoose.connect('mongodb+srv://${dbUser}:${dbPassword}@backenddb.gdhkfvp.mongodb.net/Node-API?retryWrites=true&w=majority&appName=BackendDB')
.then(() => {
    console.log('Connected to database!');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
})
.catch(() => {
    console.log('Connection failed!');
})
