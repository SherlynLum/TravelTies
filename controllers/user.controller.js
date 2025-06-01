const {validateUsername} = require("../validators/username.validator.js");
const {isUsernameTaken, updateUserProfile} = require("../services/user.service.js");
const User = require("../models/user.model.js");

const signUpUser = async (req, res) => {
    const uid = req.user.uid;

    try {
        const user = await User.create({uid});
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const updateUserProfileController = async (req, res) => {
    const uid = req.user.uid;
    const {username, profilePicUrl} = req.body;

    const validationError = validateUsername(username);
    if (validationError) {
        return res.status(400).json({message: validationError});
    }

    try {
        const nameTaken = await isUsernameTaken(username);
        if (nameTaken) {
            return res.status(400).json({message: "Username is taken"});
        }
        
        const updatedProfile = await updateUserProfile(uid, username, profilePicUrl);
        if (!updatedProfile) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(201).json(updatedProfile);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

module.exports = {
    signUpUser,
    updateUserProfileController
};