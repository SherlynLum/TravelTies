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

export {
    getProfile,
    getProfileWithUrl,
    getFriends,
    searchFriends,
    getPreference,
    updatePreference
}
