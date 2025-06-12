const validateUsername = require("../validators/username.validator.js");
const {signUpOrSignIn, checkUsernameUniqueness, updateUsername, updateProfilePic} = require("../services/user.service.js");
const generateUrl = require("../services/awss3.service.js");

const syncUser = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const {uid} = req.body; 
    if (!uid) {
        return res.status(400).json({message: "Missing uid"})
    }

    try {
        const response = await signUpOrSignIn(uid);
        if (!response.existed) { // new user
            return res.status(201).json({onboard: false, data: response.user})
        } else if (!response.onboard) { // existing user with no username, need direct to onboarding
            return res.status(200).json({onboard: false, data: response.user})
        } else { // existing user with username, direct to home screen
        return res.status(200).json({onboard: true, data: response.user});
        }
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getProfilePicUrl = async (req, res) => {
    const mimeType = req.query.type;

    if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({message: "Missing or invalid file type"});
    }

    // ensure mimeType is all lowercase
    const mimeTypeLc = mimeType.toLowerCase();
    if (mimeTypeLc === "image/jpeg") { // frontend cropped profile pic is saved as jpeg
        try {
            const {key, url} = await generateUrl(mimeTypeLc, "user-profile-pics");
            return res.status(200).json({key, url});
        } catch (e) {
            return res.status(500).json({message: e.message});
        }
    } else {
        return res.status(415).json({message: "Unsupported file type"});
    }
}

const updateUsernameController = async (req, res) => {
    const uid = req.user.uid;
    const {username} = req.body;
    // for testung without middleware: const {uid, username} = req.body;

    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    if (!username) {
        return res.status(400).json({message: "Missing username"});
    }

    const validationError = validateUsername(username);
    if (validationError) {
        return res.status(400).json({message: validationError});
    }

    try {
        const uniquenessError = await checkUsernameUniqueness(uid, username);
        if (uniquenessError) {
            return res.status(400).json({message: uniquenessError});
        }
        
        const updatedProfile = await updateUsername(uid, username);
        if (!updatedProfile) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(201).json(updatedProfile);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const updateProfilePicController = async (req, res) => {
    const uid = req.user.uid;
    const {profilePicKey} = req.body;
    // for testung without middleware: const {uid, profilePicKey} = req.body;

    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    if (!profilePicKey) {
        return res.status(400).json({message: "Missing profile picture key"});
    }

    try {
        const updatedProfile = await updateProfilePic(uid, profilePicKey);
        if (!updatedProfile) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(201).json(updatedProfile);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    syncUser,
    getProfilePicUrl,
    updateUsernameController,
    updateProfilePicController
};