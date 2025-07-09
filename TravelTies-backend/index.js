//load environment variables
require("dotenv").config();

//import libraries
const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/user.route.js");
const awsRoute = require("./routes/awss3.route.js");
const tripRoute = require("./routes/trip.route.js");
const admin = require("firebase-admin");
const serviceAccount = require("/etc/secrets/serviceAccountKey.json");

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
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(() => {
    console.log('Connection failed!');
})

//routes
app.use("/api/user", userRoute);
app.use("/api/aws", awsRoute);
app.use("/api/trip", tripRoute);
