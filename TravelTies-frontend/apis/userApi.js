import axios from "axios";
import { getDisplayUrl } from "./awsApi";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const getProfilePicUrl = async (token, key) => {
    try {
        const url = await getDisplayUrl(token, key);
        return url;
    } catch (e) {
        console.log(e);
        return "Failed to load";
    }
}

const getHeaders = (token) => {
    const header = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    return header;
}

const getProfile = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.user;
}

const getProfileWithUrl = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user`,
        {headers: getHeaders(token)}
    );
    const user = backendRes.data.user;
    if (!user.profilePicKey) {
        return user;
    }
    const profilePicUrl = await getProfilePicUrl(token, user.profilePicKey);
    return {...user, profilePicUrl};
}

const getFriends = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/friends`,
        {headers: getHeaders(token)}
    );
    const friends = backendRes.data.friends;
    const friendsWithPicUrl = await Promise.all(
        friends.map(async (friend) => {
            if (!friend.profilePicKey) {
                return friend;
            }

            const profilePicUrl = await getProfilePicUrl(token, friend.profilePicKey);
            return {...friend, profilePicUrl};
        })
    )
    return friendsWithPicUrl;
}

const searchFriends = async (token, searchTerm) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/friends/search`,
        {   headers: getHeaders(token),
            params: {
                term: searchTerm
            }
        }
    );
    const results = backendRes.data.results;
    const resultsWithPicUrl = await Promise.all(
        results.map(async (friend) => {
            if (!friend.profilePicKey) {
                return friend;
            }

            const profilePicUrl = await getProfilePicUrl(token, friend.profilePicKey);
            return {...friend, profilePicUrl};
        })
    )
    return resultsWithPicUrl;
}

const getPreference = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/preference`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.preference;
}

const updatePreference = async ({token, notificationEnabled, theme}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/user/preference`,
        {notificationEnabled, theme},
        {headers: getHeaders(token)}
    );
    return backendRes.data.preference;
}

const submitRating = async ({token, rating}) => {
    await axios.post(
        `${baseUrl}/api/user/rate`,
        {rating},
        {headers: getHeaders(token)}
    );
}

const getProfilePicUploadUrl = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/profile-pic-url`,
        {params: {type: "image/jpeg"}, headers: getHeaders(token)}
    );
    const {key, url} = backendRes.data;
    return {key, url};
}

const updateProfilePic = async ({token, key}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/user/profile-pic`,
        {profilePicKey: key},
        {headers: getHeaders(token)}
    );
    return backendRes.data.user;
}

const updateUsername = async ({token, username}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/user/username`,
        {username},
        {headers: getHeaders(token)}
    );
    return backendRes.data.user;
}

const getStripeAccount = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/stripe`,
        {headers: getHeaders(token)}
    );
    return backendRes.data;
}

const createStripeAccountUrl = async ({token, needCreateAccount, accountId}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/user/stripe`,
        {needCreateAccount, accountId},
        {headers: getHeaders(token)}
    );
    return backendRes.data.url;
}

const updateStripeAccountUrl = async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/stripe/update-url`,
        {params: {id}, headers: getHeaders(token)}
    );
    return backendRes.data.url;
}

const unlinkStripeAccount = async ({token, id}) => {
    await axios.delete(
        `${baseUrl}/api/user/stripe`,
        {params: {id}, headers: getHeaders(token)}
    );
}

const removeFriendOrRequest = async ({token, exFriendUid}) => {
    await axios.patch(
        `${baseUrl}/api/user/friend-or-request/remove`,
        {exFriendUid},
        {headers: getHeaders(token)}
    );
}

const getRequests = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/requests`,
        {headers: getHeaders(token)}
    );
    const requests = backendRes.data.requests;
    const requestsWithPicUrl = await Promise.all(
        requests.map(async (request) => {
            if (!request.profilePicKey) {
                return request;
            }

            const profilePicUrl = await getProfilePicUrl(token, request.profilePicKey);
            return {...request, profilePicUrl};
        })
    )
    return requestsWithPicUrl;
}

const acceptRequest = async ({token, newFriendUid}) => {
    await axios.patch(
        `${baseUrl}/api/user/request/accept`,
        {newFriendUid},
        {headers: getHeaders(token)}
    );
}

const searchUsers = async (token, searchTerm) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/search`,
        {   headers: getHeaders(token),
            params: {
                term: searchTerm
            }
        }
    );
    const results = backendRes.data.results;
    const resultsWithPicUrl = await Promise.all(
        results.map(async (user) => {
            if (!user.profilePicKey) {
                return user;
            }
            const profilePicUrl = await getProfilePicUrl(token, user.profilePicKey);
            return {...user, profilePicUrl};
        })
    )
    return resultsWithPicUrl;
}

const addFriend = async ({token, sendRequestToUid}) => {
    await axios.patch(
        `${baseUrl}/api/user/request/send`,
        {sendRequestToUid},
        {headers: getHeaders(token)}
    );
}

export {
    getProfile,
    getProfileWithUrl,
    getFriends,
    searchFriends,
    getPreference,
    updatePreference,
    submitRating,
    getProfilePicUploadUrl,
    updateProfilePic,
    updateUsername,
    getStripeAccount,
    createStripeAccountUrl,
    updateStripeAccountUrl,
    unlinkStripeAccount,
    removeFriendOrRequest,
    getRequests,
    acceptRequest,
    searchUsers,
    addFriend
}
