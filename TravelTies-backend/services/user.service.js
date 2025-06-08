const User = require("../models/user.model.js");

const isUsernameTaken = async (username) => {
    const existingUser = await User.findOne({username}); //key and variable names are the same 
    return !!existingUser;
}

const createUser = async (uid, username, profilePicUrl) => {
    const user = await User.create({uid, username, profilePicUrl}); //key and variable names are the same 
    return user;
}

module.exports = {
    isUsernameTaken, 
    createUser
};