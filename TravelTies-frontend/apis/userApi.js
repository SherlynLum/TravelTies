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

const getFriends = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/user/friends`,
        {headers: getHeaders(token)}
    );
    const friends = backendRes.data.friends;
    const friendsWithPicUrl = friends.map(friend => friend.profilePicKey
        ? {...friend, profilePicUrl: getProfilePicUrl(token, friend.profilePicKey)}
        : friend
    )
    return friendsWithPicUrl;
}

export {
    getProfile,
    getFriends
}
