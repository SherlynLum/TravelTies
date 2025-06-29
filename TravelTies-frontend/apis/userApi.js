import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

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

export {
    getProfile
}
