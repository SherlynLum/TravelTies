import axios from "axios";
import { getDisplayUrl } from "./awsApi";
import { toLocalDateObj } from "@/utils/dateTimeConverter";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const MAX_DATE = "9999-12-31"; // gives a super far future date for no date during sorting

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
    const trips = backendRes.data.trips;
    const tripsWithPicUrl = await Promise.all(
        trips.map(async (trip) => {
            if (!trip.profilePicKey) {
                return trip;
            }

            const profilePicUrl = await getProfilePicUrl(token, trip.profilePicKey);
            return {...trip, profilePicUrl};
        })
    )

    const today = new Date();
    today.setHours(0, 0, 0, 0); // set today's time to midnight compare only date part as startDate and endDate are floating dates at midnight

    const planning = [];
    const ongoing = [];
    const completed = [];

    tripsWithPicUrl.forEach(trip => {
        if (!trip.startDate ) { // backend ensures if no startDate, then no endDate
            planning.push(trip);
        } else {
            const startDate = toLocalDateObj(trip.startDate);
            const endDate = toLocalDateObj(trip.endDate);
            if (startDate > today) {
                planning.push(trip);
            } else if (endDate < today) {
                completed.push(trip);
            } else {
                ongoing.push(trip);
            }
        }
    });

    const ascendSort = (x, y) => {
        const xStart = x.startDate || MAX_DATE;
        const xEnd = x.endDate || MAX_DATE;

        const yStart = y.startDate || MAX_DATE;
        const yEnd = y.endDate || MAX_DATE;

        if (xStart !== yStart) { // compare start date first
            return xStart.localeCompare(yStart);
        } else { // if start date same, compare end date
            return xEnd.localeCompare(yEnd);
        }
    };

    const descendSort = (x, y) => { // for completed only, startDate and endDate always exist
        if (x.endDate !== y.endDate) { // compare end date first in descending order
            return y.endDate.localeCompare(x.endDate);
        } else { // if end date is the same, compare start date in descending order
            return y.startDate.localeCompare(x.startDate);
        }
    };

    planning.sort(ascendSort);
    ongoing.sort(ascendSort);
    completed.sort(descendSort);
    return {planning, ongoing, completed};
}

const getUploadUrl = async (token) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/profile-pic-url`,
        {params: {type: "image/jpeg"}, headers: getHeaders(token)}
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

const getTripOverviewWithUrl = async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/overview/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    const trip = backendRes.data.trip;
    if (!trip.profilePicKey) {
        return trip;
    }
    const profilePicUrl = await getProfilePicUrl(token, trip.profilePicKey);
    return {...trip, profilePicUrl};
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
        null,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const deleteTrip = async (token, id) => {
    await axios.delete(
        `${baseUrl}/api/trip/${encodeURIComponent(id)}`,
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
    const resultsWithPicUrl = await Promise.all(
        results.map(async (trip) => {
            if (!trip.profilePicKey) {
                return trip;
            }

            const profilePicUrl = await getProfilePicUrl(token, trip.profilePicKey);
            return {...trip, profilePicUrl};
        })
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
    const resultsWithPicUrl = await Promise.all(
        results.map(async (trip) => {
            if (!trip.profilePicKey) {
                return trip;
            }

            const profilePicUrl = await getProfilePicUrl(token, trip.profilePicKey);
            return {...trip, profilePicUrl};
        })
    )
    return resultsWithPicUrl;
}


const getJoinCode = async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/joincode/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const getParticipants= async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/participants/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    const participants = backendRes.data.participants;
    const participantsWithPicUrl = await Promise.all(
        participants.map(async (participant) => {
            if (!participant.profilePicKey) {
                return participant;
            }

            const profilePicUrl = await getProfilePicUrl(token, participant.profilePicKey);
            return {...participant, profilePicUrl};
        })
    )
    return participantsWithPicUrl;
}

const getRequests= async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/requests/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    const requests = backendRes.data.joinRequests;
    const requestsWithPicUrl = await Promise.all(
        requests.map(async (request) => {
            if (!request.profilePicKey) {
                return request;
            }

            const profilePicUrl = await getProfilePicUrl(token, request.profilePicKey);
            return {...request, profilePicUrl};
        })
    )
    return requestsWithPicUrl;
}

const updateTrip = async ({token, id, name, profilePicKey, startDate, endDate, noOfDays, noOfNights, 
    tripParticipants}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/trip/${encodeURIComponent(id)}`,
        {name, profilePicKey, startDate, endDate, noOfDays, noOfNights, tripParticipants},
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const cancelTrip = async ({token, id}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/trip/cancel/${encodeURIComponent(id)}`,
        null,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const leaveTrip = async ({token, id}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/trip/leave/${encodeURIComponent(id)}`,
        null,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const updateRequests = async ({token, id, acceptedRequests, declinedUids}) => {
    const backendRes = await axios.patch(
        `${baseUrl}/api/trip/requests/${encodeURIComponent(id)}`,
        {acceptedRequests, declinedUids},
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const getOrderInTab = async ({token, id}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/tabs/${encodeURIComponent(id)}`,
        {headers: getHeaders(token)}
    );
    return backendRes.data.trip;
}

const getCardsInTab = async ({token, id, tab}) => {
    const backendRes = await axios.get(
        `${baseUrl}/api/trip/${encodeURIComponent(id)}/cards`,
        {
            headers: getHeaders(token),
            params: {tab}
        }
    );
    return backendRes.data.cards;
}

export {
    getActiveTrips,
    getUploadUrl,
    createTrip,
    getTripOverview,
    getTripOverviewWithUrl,
    getBinTrips,
    restoreTrip,
    deleteTrip,
    searchInBin,
    searchActiveTrips,
    getJoinCode,
    getParticipants,
    getRequests,
    updateTrip,
    cancelTrip,
    leaveTrip,
    updateRequests,
    getOrderInTab,
    getCardsInTab
}

