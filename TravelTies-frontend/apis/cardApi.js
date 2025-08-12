import axios from "axios";
import { getDisplayUrl } from "./awsApi";
import { CardToBeUpdated } from "../types/cards";

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

const createDestinationCard = async ({token, tripId, title, country, city, description, startDate, 
    startTime, endDate, endTime, picIds, docs, webUrls}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/card/destination`,
        {tripId, title, country, city, description, startDate, startTime, endDate, endTime, picIds, 
        docs, webUrls},
        {headers: getHeaders(token)}
    );
    return backendRes.data.card;
}

const createTransportationCard = async ({token, tripId, title, description, startDate, startTime, 
    endDate, endTime, departureAddress, arrivalAddress, picIds, docs, webUrls}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/card/transportation`,
        {tripId, title, description, startDate, startTime, endDate, endTime, departureAddress, 
        arrivalAddress, picIds, docs, webUrls},
        {headers: getHeaders(token)}
    );
    return backendRes.data.card;
}

const createGeneralCard = async ({token, tripId, cardType, title, description, startDate, startTime, 
    endDate, endTime, generalAddress, picIds, docs, webUrls}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/card`,
        {tripId, cardType, title, description, startDate, startTime, endDate, endTime, 
        generalAddress, picIds, docs, webUrls},
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

const getUploadDocUrl = async ({token, mimeType}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/card/doc-url`,
        {params: {type: mimeType}, headers: getHeaders(token)}
    );
    const {key, url} = backendRes.data;
    return {key, url};
}

const getCard = async ({token, cardId}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/card/${encodeURIComponent(cardId)}`,
        {headers: getHeaders(token)}
    );
    const card = backendRes.data.card;
    if (!card) {
        throw new Error("No card is found");
    }
    const pics = card.picIds;
    const docs = card.docs;
    const picsWithUrl = await Promise.all(pics.map(async (pic) => {
        if (pic.key) {
            const url = await getUrl(token, pic.key);
            return {...pic, url};
        } else {
            return null; // shouldn't happen but as fallback
        }
    }));
    const filteredPicsWithUrl = picsWithUrl.filter(pic => pic.url);
    const picUrls = filteredPicsWithUrl.map(pic => pic.url);
    const updatedDocs = await Promise.all(docs.map(async (doc) => {
        const url = await getUrl(token, doc.key);
        return {...doc, url}
    }));
    return {...card, picUrls, picIds: picsWithUrl, docs: updatedDocs};
}

const updateCard = async ({token, cardId, cardType, title, description, startDate, startTime, endDate,
    endTime, generalAddress, departureAddress, arrivalAddress, country, city, picIds, docs, webUrls}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/card/${encodeURIComponent(cardId)}`,
        {cardType, title, description, startDate, startTime, endDate, endTime, generalAddress, 
        departureAddress, arrivalAddress, country, city, picIds, docs, webUrls},
        {headers: getHeaders(token)}
    );
    return backendRes.data.card;
}

export {
    deleteCard,
    createNoteCard,
    createDestinationCard,
    createTransportationCard,
    createGeneralCard,
    getUploadPicUrl,
    getUploadDocUrl,
    getCard,
    updateCard
}
