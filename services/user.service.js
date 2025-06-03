const User = require("../models/user.model.js");

const signUpOrSignIn = async (uid) => {
    const existingUser = await User.findOne({uid}); //key and variable names are the same
    if (!existingUser) {
        const newUser = await User.create({uid});
        return {existed: false, user: newUser};
    } else if (!existingUser.username) {
        return {existed: true, onboard: false, user: existingUser}
    } else {
        return {existed: true, onboard: true, user: existingUser}
    }
}

const isUsernameTaken = async (username) => {
    const existingUser = await User.findOne({username}); //key and variable names are the same 
    return !!existingUser;
}

const updateUserProfile = async (uid, username, profilePicUrl) => {
    if (!profilePicUrl) {
        const updatedProfile = await User.findOneAndUpdate(
            {uid}, //key and variable names are the same 
            {$set: {username}}, //key and variable names are the same 
            {new: true, runValidators: true}
        )
        return updatedProfile;
    } else {
        const updatedProfile = await User.findOneAndUpdate(
            {uid}, //key and variable names are the same 
            {$set: {username, profilePicUrl}}, //key and variable names are the same 
            {new: true, runValidators: true}
        )
        return updatedProfile
    }
}

module.exports = {
    signUpOrSignIn,
    isUsernameTaken, 
    updateUserProfile
};