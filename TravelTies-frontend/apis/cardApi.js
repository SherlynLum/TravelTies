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

const deleteCard = async (token, id) => {
    await axios.delete(
        `${baseUrl}/api/card/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
}

const createNoteCard = async ({token, tripId, title, description, startDate, startTime, endDate, 
    endTime}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/card/note`,
        {tripId, title, description, startDate, startTime, endDate, endTime},
        {headers: getHeaders(token)}
    );
    return backendRes.data.card;
}

const getUploadPicUrl = async ({token, mimeType}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/card/pic-url`,
        {params: {type: mimeType}, headers: getHeaders(token)}
    );
    const {key, url} = backendRes.data;
    return {key, url};
}

export {
    deleteCard,
    createNoteCard,
    getUploadPicUrl
}
