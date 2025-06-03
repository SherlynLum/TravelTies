const validateUsername = require("../validators/username.validator.js");
const {signUpOrSignIn, isUsernameTaken, updateUserProfile} = require("../services/user.service.js");

const syncUser = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const {uid} = req.body; 

    try {
        const response = await signUpOrSignIn(uid);
        if (!response.existed) { // new user
            return res.status(201).json({onboard: "incomplete", data: response.user})
        } else if (!response.onboard) { // existing user with no username, need direct to onboarding
            return res.status(200).json({onboard: "incomplete", data: response.user})
        } else { // existing user with username, direct to home screen
        return res.status(200).json({onboard: "complete", data: response.user});
        }
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const updateUserProfileController = async (req, res) => {
    const uid = req.user.uid;
    const {username, profilePicUrl} = req.body;
    // for testung without middleware: const {uid, username, profilePicUrl} = req.body;

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
    syncUser,
    updateUserProfileController
};