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

export {
    getActiveTrips
}

