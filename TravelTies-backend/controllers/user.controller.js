const validateUsername = require("../validators/username.validator.js");
const {signUpOrSignIn, checkUsernameUniqueness, updateUsername, updateProfilePic, 
    getUsernamePic, getFriends, searchFriends, searchUsers, getUiPreference,
    updateUiPreference, getFriendRequests, removeFriend, acceptRequest,
    sendRequest, receiveRequest, rate, getStripeAccount, updateStripeAccount,
    removeStripeAccount
} = require("../services/user.service.js");
const {generateUploadUrl} = require("../services/awss3.service.js");
const mongoose = require('mongoose');
const admin = require("firebase-admin");
const { getAccountDetails, createAccount, createLinkForOnboard, createLinkForUpdate, disconnectAccount } = require("../services/stripe.service.js");

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
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
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

const getUiPreferenceController = async (req, res) => {
    const uid = req.user.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    
    try {
        const preference = await getUiPreference(uid);
        if (!preference) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({preference})
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const updateUiPreferenceController = async (req, res) => {
    const uid = req.user.uid;
    const {notificationEnabled, theme} = req.body;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    
    try {
        const preference = await updateUiPreference({uid, notificationEnabled, theme});
        if (!preference) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({preference})
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getFriendRequestsController = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    try {
        const requests = await getFriendRequests(uid);
        return res.status(200).json({requests});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const removeFriendOrRequest = async (req, res) => {
    const currentUid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!currentUid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {exFriendUid} = req.body

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await removeFriend({uid: currentUid, uidToBeRemoved: exFriendUid, session});
        await removeFriend({uid: exFriendUid, uidToBeRemoved: currentUid, session});
        await session.commitTransaction();
        return res.sendStatus(200);
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const acceptRequestController = async (req, res) => {
    const currentUid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!currentUid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {newFriendUid} = req.body

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await acceptRequest({uid: currentUid, acceptUid: newFriendUid, session});
        await acceptRequest({uid: newFriendUid, acceptUid: currentUid, session});
        await session.commitTransaction();
        return res.sendStatus(200);
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const addFriend = async (req, res) => {
    const currentUid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!currentUid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {sendRequestToUid} = req.body

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await sendRequest({uid: currentUid, sendRequestToUid, session});
        await receiveRequest({uid: sendRequestToUid, receiveRequestFromUid: currentUid, session});
        await session.commitTransaction();
        return res.sendStatus(200);
    } catch (e) {
        await session.abortTransaction();
        return res.status(500).json({message: e.message});
    } finally {
        session.endSession();
    }
}

const linkEmail = async (req, res) => {
    const uid = req.user.uid;
    const {email, password} = req.body;
    if (!uid || !email || !password) {
        return res.status(400).json({message: "Missing uid or email or password"});
    }
    try {
        const firebaseUser = await admin.auth().updateUser(uid, {
            email, password, emailVerified: false
        });
        return res.status(200).json({firebaseUser});
    } catch (e) {
        return res.status(500).json({errCode: e.code});
    }
}

const rateUs = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {rating} = req.body;
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({message: "Invalid rating"});
    }
    try {
        const res = await rate({uid, rating});
        return res.sendStatus(201);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getOrUpdateStripeAccount = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    try {
        const account = await getStripeAccount(uid);
        if (!account) {
            return res.status(200).json({hasStripeAccount: false, hasOnboard: false});
        }

        const accountId = account.stripeAccountId;
        const latestAccountDetails = await getAccountDetails(accountId);
        await updateStripeAccount({uid, account: latestAccountDetails});
        if (!latestAccountDetails.details_submitted) {
            return res.status(200).json({hasStripeAccount: true, hasOnboard: false, accountId});
        } else {
            return res.status(200).json({hasStripeAccount: true, hasOnboard: true, accountId});
        }
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getStripeOnboardUrl = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {needCreateAccount, accountId} = req.body;

    try {
        if (!needCreateAccount && !accountId) {
            return res.status(400).json({message: "Account id must be provided if Stripe account has already been created"})
        }
        let id = accountId;
        if (needCreateAccount) {
            const account = await createAccount();
            await updateStripeAccount({uid, account});
            id = account.id;
        } 
        const url = await createLinkForOnboard(id);
        if (!url) {
            throw new Error("No onboard url is returned");
        }
        return res.status(200).json({url})
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const getStripeUpdateUrl = async (req, res) => {
    const {id} = req.query;
    if (!id) {
        return res.status(400).json({message: "Missing Stripe account id"});
    }

    try {
        const url = await createLinkForUpdate(id);
        if (!url) {
            throw new Error("No onboard url is returned");
        }
        return res.status(200).json({url})
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const unlinkStripeAccount = async (req, res) => {
    const uid = req.user.uid;
    // testing without middleware: const uid = req.query.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }
    const {id} = req.query;
    if (!id) {
        return res.status(400).json({message: "Missing account id"});
    }

    try {
        await disconnectAccount(id);
        await removeStripeAccount(uid);
        return res.sendStatus(200);
    } catch (e) {
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
    searchNonFriends,
    getUiPreferenceController,
    updateUiPreferenceController,
    getFriendRequestsController,
    removeFriendOrRequest,
    acceptRequestController,
    addFriend,
    linkEmail,
    rateUs,
    getOrUpdateStripeAccount,
    getStripeOnboardUrl,
    getStripeUpdateUrl,
    unlinkStripeAccount
};