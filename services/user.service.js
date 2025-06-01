const User = require("../models/user.model.js");

const isUsernameTaken = async (username) => {
    const existingUser = await User.findOne({username}); //key and variable names are the same 
    return !!existingUser;
}

const updateUserProfile = async (uid, username, profilePicUrl) => {
    const updatedProfile = await User.findOneAndUpdate(
        {uid}, //key and variable names are the same 
        {$set: {username, profilePicUrl}}, //key and variable names are the same 
        {new: true, runValidators: true}
    )
    return updatedProfile;
}

module.exports = {
    isUsernameTaken, 
    updateUserProfile
};