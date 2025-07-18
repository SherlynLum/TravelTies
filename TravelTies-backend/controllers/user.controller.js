const validateUsername = require("../validators/username.validator.js");
const {signUpOrSignIn, checkUsernameUniqueness, updateUsername, updateProfilePic, 
    getUsernamePic, getFriends, searchFriends, searchUsers
} = require("../services/user.service.js");
const {generateUploadUrl} = require("../services/awss3.service.js");

const syncUser = async (req, res) => {
    const uid = req.user.uid;
    // for testing without middleware: const {uid} = req.body; 
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    try {
        const response = await signUpOrSignIn(uid);
        return res.status(200).json({onboard: response.onboard, data: response.user});
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
            const {key, url} = await generateUploadUrl(mimeTypeLc, "user-profile-pics");
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
        return res.status(200).json({user: updatedProfile});
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
        return res.status(200).json({user: updatedProfile});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getCurrentUserProfile = async (req, res) => {
    const uid = req.user.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    
    try {
        const profile = await getUsernamePic(uid);
        if (!profile) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({user: profile})
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getFriendsController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    try {
        const friends = await getFriends(uid);
        return res.status(200).json({friends});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const searchFriendsController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const searchTerm = req.query.term;

    try {
        const searchResults = await searchFriends({uid, searchTerm});
        return res.status(200).json({results: searchResults});
    } catch (e) {
        if (e.message === "No user is found") {
            return res.status(404).json({message: e.message});
        } 
        return res.status(500).json({message: e.message});
    }
}

const searchNonFriends = async (req, res) => {
    // const uid = req.user.uid;
    // testing without middleware: 
    const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const searchTerm = req.query.term;

    try {
        const searchResults = await searchUsers({uid, searchTerm});
        return res.status(200).json({results: searchResults});
    } catch (e) {
        if (e.message === "No user is found") {
            return res.status(404).json({message: e.message});
        } 
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    syncUser,
    getProfilePicUrl,
    updateUsernameController,
    updateProfilePicController,
    getCurrentUserProfile,
    getFriendsController,
    searchFriendsController,
    searchNonFriends
};