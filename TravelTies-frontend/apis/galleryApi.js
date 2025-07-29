import axios from "axios";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL + "/api", // Make sure this is set in .env
});

// ✅ Get all photos by tripId
export const getPhotos = async (tripId) => {
  const res = await API.get(`/gallery/photos/${tripId}`);
  return res.data;
};

// ✅ Get all albums by tripId
export const getAlbums = async (tripId) => {
  const res = await API.get(`/gallery/albums/${tripId}`);
  return res.data;
};

// ✅ Upload photo (correct endpoint and headers)
export const uploadPhoto = async (tripId, asset) => {
  const formData = new FormData();
  formData.append("photos", {
    uri: asset.uri,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  const res = await API.post(`/gallery/photos/${tripId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ✅ Create a new album
export const createAlbum = async (tripId, name) => {
  const res = await API.post(`/gallery/albums/${tripId}`, { name });
  return res.data;
};