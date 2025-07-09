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
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "image/jpeg",
        },
        body: blob,
    });
    
    if (!response.ok) {
        throw new Error("Failed to upload trip profile picture to AWS S3")
    }
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

