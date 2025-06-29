import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const getHeaders = (token) => {
    const header = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
    return header;
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
        `${baseUrl}/api/trip/overview/${id}`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

export {
    getActiveTrips,
    getUploadUrl,
    createTrip,
    getTripOverview
}

