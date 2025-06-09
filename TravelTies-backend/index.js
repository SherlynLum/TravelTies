//load environment variables
require("dotenv").config();

//import libraries
const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/user.route.js")
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
mongoose.connect(process.env.DB_URL).then(() => {
    console.log('Connected to database!');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(() => {
    console.log('Connection failed!');
})

//routes
app.use("/api/user", userRoute);
