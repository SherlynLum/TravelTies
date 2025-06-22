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

const checkUsernameUniqueness = async (uid, username) => {
    const existingUser = await User.findOne({username}); //key and variable names are the same 
    if (!existingUser) {
        return;
    } else if (existingUser.uid === uid) {
        return "No changes detected";
    } else {
        return "This username is already taken";
    }
}

const updateUsername = async (uid, username) => {
    const updatedProfile = await User.findOneAndUpdate(
        {uid}, //key and variable names are the same 
        {$set: {username}}, //key and variable names are the same 
        {new: true, runValidators: true}
    )
    return updatedProfile;
} 

const updateProfilePic = async (uid, profilePicKey) => {
    const updatedProfile = await User.findOneAndUpdate(
        {uid}, //key and variable names are the same 
        {$set: {profilePicKey}}, //key and variable names are the same 
        {new: true, runValidators: true}
    )
    return updatedProfile;
} 

const getUsernamePic = async (uid) => {
    const profile = await User.findOne({uid}, {
        _id: 0, username: 1, profilePicKey: 1 // explicitly exclude object id 
    })
    return profile;
}

module.exports = {
    signUpOrSignIn,
    checkUsernameUniqueness, 
    updateUsername,
    updateProfilePic,
    getUsernamePic
};