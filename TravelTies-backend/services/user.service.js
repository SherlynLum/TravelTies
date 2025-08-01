const User = require("../models/user.model.js");
const Rating = require("../models/rating.model.js");
const SEARCH_RES_LIMIT = 10;

const signUpOrSignIn = async (uid) => {
    const user = await User.findOneAndUpdate({uid},
        {$setOnInsert: {uid}}, // if this uid does not exists, create
        {new: true, runValidators: true, upsert: true}
    )
    const onboard = !!(user.username);
    return {onboard, user};
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
        _id: 0, uid: 1, username: 1, profilePicKey: 1 // explicitly exclude object id 
    })
    return profile;
}

const getFriends = async (uid) => {
    const friends = await User.aggregate([
        {$match: {uid}},
        {$unwind: "$friends"},
        {$match: {"friends.status": "friends"}},
        {$lookup: {
            from: "users",
            localField: "friends.friendUid",
            foreignField: "uid",
            as: "friendsProfiles"
        }},
        {$unwind: "$friendsProfiles"},
        {$project: {
            _id: 0,
            uid: "$friendsProfiles.uid",
            username: "$friendsProfiles.username",
            profilePicKey: "$friendsProfiles.profilePicKey"
        }},
        {$sort: {username: 1}}
    ]).collation({locale: "en", strength: 2});
    return friends;
}

const searchFriends = async ({uid, searchTerm}) => {
    if (!searchTerm) {
        return [];
    }
    const user = await User.findOne({uid}, {_id: 0, "friends.friendUid": 1, "friends.status": 1});
    if (!user) {
        throw new Error("No user is found");
    }
    const friendsUids = user.friends.filter(friend => friend.status === "friends")
        .map(friend => friend.friendUid);
    if (friendsUids.length === 0) {
        return []; // if no friends then no need search already
    }

    const searchResults = await User.aggregate([
        {$search: {
            index: "usernameSearch",
            autocomplete: {
                query: searchTerm,
                path: "username",
                fuzzy: {
                    maxEdits: 1,
                    prefixLength: 1
                }
            }
        }},
        {$match: {uid: {$in: friendsUids}}},
        {$project: {
            _id: 0,
            uid: 1,
            username: 1,
            profilePicKey: 1
        }},
        {$limit: SEARCH_RES_LIMIT}
    ]);
    return searchResults;
}

// search users who are not yet friends
const searchUsers = async ({uid, searchTerm}) => {
    if (!searchTerm) {
        return [];
    }
    const user = await User.findOne({uid}, {_id: 0, "friends.friendUid": 1});
    if (!user) {
        throw new Error("No user is found");
    }
    const friendsUids = user.friends.map(friend => friend.friendUid); // exclue all friends including those have sent or have received requests
    const excludeUids = [...friendsUids, uid]; // exclude themselves as well

    const searchResults = await User.aggregate([
        {$search: {
            index: "usernameSearch",
            autocomplete: {
                query: searchTerm,
                path: "username"
            }
        }},
        {$match: {uid: {$nin: excludeUids}}},
        {$project: {
            _id: 0,
            uid: 1,
            username: 1,
            profilePicKey: 1
        }},
        {$limit: SEARCH_RES_LIMIT}
    ]);
    return searchResults;
}

const getUiPreference = async (uid) => {
    const preference = await User.findOne({uid}, {_id: 0, notificationEnabled: 1, theme: 1});
    return preference;
}

const updateUiPreference = async ({uid, notificationEnabled, theme}) => {
    const updatedPreference = await User.findOneAndUpdate(
        {uid}, //key and variable names are the same 
        {$set: {notificationEnabled, theme}}, //key and variable names are the same 
        {new: true, runValidators: true}
    )
    return updatedPreference;
} 

const getFriendRequests = async (uid) => {
    const requests = await User.aggregate([
        {$match: {uid}},
        {$unwind: "$friends"},
        {$match: {"friends.status": "request_received"}},
        {$lookup: {
            from: "users",
            localField: "friends.friendUid",
            foreignField: "uid",
            as: "friendsProfiles"
        }},
        {$unwind: "$friendsProfiles"},
        {$project: {
            _id: 0,
            uid: "$friendsProfiles.uid",
            username: "$friendsProfiles.username",
            profilePicKey: "$friendsProfiles.profilePicKey",
            requestTime: "$friends.requestTime"
        }},
        {$sort: {requestTime: 1}}
    ]);
    return requests;
}

const removeFriend = async ({uid, uidToBeRemoved, session}) => {
    const updatedUser = await User.findOneAndUpdate({uid}, 
        {$pull: {friends: {friendUid: uidToBeRemoved}}}, 
        {session, new: true, runValidators: true});
    return updatedUser;
}

const acceptRequest = async ({uid, acceptUid, session}) => {
    const updatedUser = await User.findOneAndUpdate({uid}, 
        {$set: {"friends.$[friend].status": "friends"}}, 
        {arrayFilters: [{"friend.friendUid": acceptUid}], session, new: true, 
            runValidators: true});
    return updatedUser;
}

const sendRequest = async ({uid, sendRequestToUid, session}) => {
    const updatedUser = await User.findOneAndUpdate({uid},
        {$addToSet: {friends: {
            friendUid: sendRequestToUid,
            status: "request_sent",
            requestTime: new Date
        }}},
        {session, new: true, runValidators: true});
    return updatedUser;
}

const receiveRequest = async ({uid, receiveRequestFromUid, session}) => {
    const updatedUser = await User.findOneAndUpdate({uid},
        {$addToSet: {friends: {
            friendUid: receiveRequestFromUid,
            status: "request_received",
            requestTime: new Date
        }}},
        {session, new: true, runValidators: true});
    return updatedUser;
}

const rate = async ({uid, rating}) => {
    const res = await Rating.create({uid, rating});
    return res;
}

const getStripeAccount = async (uid) => {
    const user = await User.findOne({uid}, {"stripeAccount": 1});
    if (!user) {
        throw new Error("No user is found");
    }
    return user.stripeAccount;
}

const updateStripeAccount = async ({uid, account}) => {
    const updatedUser = await User.findOneAndUpdate({uid},
        {$set:{stripeAccount: {
            stripeAccountId: account.id,
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled
        }}},
        {new: true, runValidators: true}
    );
    return updatedUser;
} 

const removeStripeAccount = async (uid) => {
    const updatedUser = await User.findOneAndUpdate({uid},
        {$unset: {stripeAccount: ""}},
        {new: true, runValidators: true}
    );
    return updatedUser;
} 

module.exports = {
    signUpOrSignIn,
    checkUsernameUniqueness, 
    updateUsername,
    updateProfilePic,
    getUsernamePic,
    getFriends, 
    searchFriends, 
    searchUsers,
    getUiPreference,
    updateUiPreference,
    getFriendRequests,
    removeFriend,
    acceptRequest,
    sendRequest,
    receiveRequest,
    rate,
    getStripeAccount,
    updateStripeAccount,
    removeStripeAccount
};