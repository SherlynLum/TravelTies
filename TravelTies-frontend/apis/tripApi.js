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

const getProfilePicUrl = async (token, key) => {
    try {
        const url = await getDisplayUrl(token, key);
        return url;
    } catch (e) {
        console.log(e);
        return "Failed to load";
    }
}

const getActiveTrips = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trips;
}

const getUploadUrl = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/profile-pic-url`,
        {headers: getHeaders(token)}
    );
    const {key, url} = backendRes.data;
    return {key, url};
}

const createTrip = async ({token, name, profilePicKey, startDate, endDate, noOfDays, noOfNights, 
    tripParticipants}) => {
    const backendRes = await axios.post(
        `${baseUrl}/api/trip`,
        {name, profilePicKey, startDate, endDate, noOfDays, noOfNights, tripParticipants},
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const getTripOverview = async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/overview/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const getBinTrips = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/bin`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trips;
}

const restoreTrip = async (token, id) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/trip/restore/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const deleteTrip = async (token, id) => {
    await axios.delete(
        `${baseUrl}/api/trip/bin`,
        {headers: getHeaders(token)}
    );
}

const searchInBin = async (token, searchTerm) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/bin/search`,
        {   headers: getHeaders(token),
            params: {
                term: searchTerm
            }
        }
    );
    const results = backendRes.data.results;
    const resultsWithPicUrl = results.map(trip => trip.profilePicKey
        ? {...trip, profilePicUrl: getProfilePicUrl(token, trip.profilePicKey)}
        : trip
    )
    return resultsWithPicUrl;
}

const searchActiveTrips = async (token, searchTerm) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/search`,
        {   headers: getHeaders(token),
            params: {
                term: searchTerm
            }
        }
    );
    const results = backendRes.data.results;
    const resultsWithPicUrl = results.map(trip => trip.profilePicKey
        ? {...trip, profilePicUrl: getProfilePicUrl(token, trip.profilePicKey)}
        : trip
    )
    return resultsWithPicUrl;
}

export {
    getActiveTrips,
    getUploadUrl,
    createTrip,
    getTripOverview,
    getBinTrips,
    restoreTrip,
    deleteTrip,
    searchInBin,
    searchActiveTrips
}

