import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const getHeaders = (token) => {
    const header = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    return header;
}

const getDisplayUrl = async (token, key) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/aws`,
        {headers: getHeaders(token), params: {key}}
    );
    return backendRes.data.url;
}

export {
    getDisplayUrl
}

