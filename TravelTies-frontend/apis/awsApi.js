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

const uploadPic = async (url, blob) => {
    await axios.put(url, blob, {
        headers: {
            "Content-Type": "image/jpeg"
        }
    });
}

const deleteObj = async (token, key) => {
    await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/aws`, 
        { 
            data: { key },
            headers: getHeaders(token)
        }
    )
}

export {
    getDisplayUrl,
    uploadPic,
    deleteObj
}

