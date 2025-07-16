import axios from "axios";
import { getDisplayUrl } from "./awsApi";
import { toLocalDateObj } from "@/utils/dateConverter";

const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const MAX_DATE = "9999-12-31"; // gives a super far future date for no date during sorting

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

export {
    deleteCard
}
