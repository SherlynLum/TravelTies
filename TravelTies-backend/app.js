//import libraries
const express = require("express");
const userRoute = require("./routes/user.route.js");
const awsRoute = require("./routes/awss3.route.js");
const tripRoute = require("./routes/trip.route.js");
const photoRoute = require("./routes/photo.route.js");
const itineraryRoute = require("./routes/itinerary.route.js");
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

//routes
app.use("/api/user", userRoute);
app.use("/api/aws", awsRoute);
app.use("/api/trip", tripRoute);
app.use("/api/photo", photoRoute); // for photos uploaded from Itinerary screens
app.use("/api/card", itineraryRoute);

module.exports = app;