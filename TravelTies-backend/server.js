//load environment variables
require("dotenv").config();

//import libraries
const mongoose = require("mongoose");
const app = require("./app.js");

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

