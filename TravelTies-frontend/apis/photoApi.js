import axios from "axios";
import { getDisplayUrl } from "./awsApi";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const getHeaders = (token) => {
    const header = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    return header;
}

const getUrl = async (token, key) => {
    try {
        const url = await getDisplayUrl(token, key);
        return url;
    } catch (e) {
        console.log(e);
        return "Failed to load";
    }
}

const uploadPhotos = async ({token, tripId, keys}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/photo`,
        {tripId, keys},
        {headers: getHeaders(token)}
    );
    return backendRes.data.picIds;
}

export {
    uploadPhotos
}